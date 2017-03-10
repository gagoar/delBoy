#!/usr/bin/env node

const fs = require('fs');
const spawn = require('child_process').spawn;
const createGzip = require('zlib').createGzip;

const glob = require('glob');
const split = require('split');
const request = require('request');
const tar = require('tar-fs');

const COMMENT_LINES =/^#/;

const IGNORE_FILES = ['.npmignore', '.yarnignore'];

const handleResponse = (packageUrl, cb, err, resp, body) => {
    if (err) {
        throw err
    }

    if (cb) {
        cb(packageUrl, resp, body, err);
    }

    if (resp.statusCode === 200) {
        console.log(`successfully published version ${packageUrl}`);
    }
    else {
        console.error(`mmm, something is going on here... we got back an unexpected status code back (${resp.statusCode})`);
        console.error(resp);
    }

}

const map = (header) => {
    header.name = `package/${header.name}`;
    return header
  };

// we compress and upload the package after gathering the list of packages needed
const compressAndUpload = (dir, packageUrl, cb, entries) => (
    tar.pack(dir, {entries, map})
        .pipe(createGzip())
        .pipe(
            request.put(packageUrl, handleResponse.bind(null, packageUrl, cb))
        )
);

_getFilesByIgnore = (ignoreFile, dir, onDone, onError) => {


    console.log(`using ignorefile: ${ignoreFile}`);

    const globRules = ['node_modules'];

    fs.createReadStream(`${dir}/${ignoreFile}`)
        .pipe(split())
        .on('data',
            (pattern) => pattern &&
            !pattern.match(COMMENT_LINES) &&
            globRules.push(pattern)
        ).on('end', () =>
            glob("**/*", { cwd: dir, ignore: globRules }, (err, files) => onDone(files))
        ).on('error', onError);
};

_getFilesByGit = (dir, onDone, onError) => {
    const files = [];

    console.log(`using git to get the list of files to be packaged`);

    spawn('git', ['ls-files'], {cwd: dir}).stdout
        .pipe(split())
        .on('data', (line) => files.push(line))
        .on('end', () => onDone(files))
        .on('error', onError);
};

_getFiles = (dir) => {
    // we would follow different strategies here:
    // 1. if .npmignore is there, use it.
    // 2. if .yarnignore is there, use it.
    // 3. get files from git

    const ignoreFile = IGNORE_FILES.find((file) => fs.existsSync(`${dir}/${file}`));

    const action = ignoreFile ? _getFilesByIgnore.bind(null, ignoreFile) : _getFilesByGit;

    return new Promise(action.bind(null, dir));
}

const dryRun = (dir, cb) => {

    _getFiles(dir).then((files) => {
        console.log(`all these files would be packaged: ${JSON.stringify(files, null, '\t')}`);
    });
};

const publish = (dir, registry, name, version, cb) => {
    const packageUrl = `${registry}/package/${name}/${version}`;

    _getFiles(dir).then(compressAndUpload.bind(null, dir, packageUrl, cb));
};


module.exports = {
    publish,
    dryRun,
};

