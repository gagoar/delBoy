#!/usr/bin/env node

const fs = require('fs');
const optimist = require('optimist');
const publish = require('../index');

const argv = optimist
    .usage('delBoy  publish --> Publish current module')
    .usage('delBoy  --> dry run')
    .default({ dir: process.cwd()})
    .describe('u', 'The base URL of the Reggie server (e.g. http://reggie:8080)')
    .describe('dir', 'the directory from where we want to build the package (eg. current directy)')
    .describe('package', 'the package.json (eg. package.json)')
    .alias('u', 'url')
    .alias('dir', 'directory')
    .argv;

argv.command = argv._[0];


if (argv.h) {
  optimist.showHelp();
  process.exit(0);
}

const packageInfo = JSON.parse(fs.readFileSync(`${argv.dir}/package.json`));

const registry = argv.u ? argv.u : packageInfo.publishConfig.registry;

const publishPackage = () => {
    if (!registry) {
        console.error('ups, private npm server url not found, please provide one via package.json (publishConfig: {registry: server-url} or via command line with -u option');
        process.exit(0);
    }
    publish(argv.dir, registry, packageInfo.name, packageInfo.version);
}

if (argv.command === 'publish') {
    publishPackage();

} else {
    console.log(`dry run!...`);
    console.log(`packageName: ${ packageInfo.name }, version: ${packageInfo.version}, and it would be published to ${registry}`);
    console.log(`run delBoy publish to make the actual publishing of the package`);
}
