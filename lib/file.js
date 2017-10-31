'use strict';
const { existsSync, lstatSync, readdirSync, writeFileSync, readFileSync } = require('fs');
const { join, resolve, basename } = require('path');

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory);
const getGraphQLFiles = source => readdirSync(source).map(name => name).filter(name => name.substr(-7) === "graphql");

module.exports = {
    getDirectories,
    getGraphQLFiles,
    fileExists: source => existsSync(source),
    join,
    resolve,
    basename,
    readFileSync,
    writeFileSync
};