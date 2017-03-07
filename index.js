#!/usr/bin/env node

const fs = require('fs');
const spawn = require('child_process').spawn;
const createGzip = require('zlib').createGzip;

const split = require('split');
const request = require('request');
const tar = require('tar-fs');

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
const compressAndUpload = (dir, files, packageUrl, cb) => (
    tar.pack(dir, {entries: files, map})
        .pipe(createGzip())
        .pipe(
            request.put(packageUrl, handleResponse.bind(null, packageUrl, cb))
        )
);

//we publish the package to the remote reggie server.

const publish = (dir, registry, name, version, cb) => {

    const gitList = spawn('git', [ 'ls-files' ], {cwd: dir});
    const packageUrl = `${registry}/package/${name}/${version}`;
    const files = [];

    gitList.stdout.pipe(split())
        .on('data', (line) => files.push(line))
        .on('end', compressAndUpload.bind(null, dir,  files, packageUrl, cb));
}

module.exports = publish;
