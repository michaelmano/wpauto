# wpauto

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## Table of Contents

- [Introduction](#introduction)
- [Install](#install)
- [Todo](#todo)


## Introduction

What does wpauto do?
- Downloads and extracts Wordpress into a directory of your choosing.
- If you have a custom Wordpress theme it will also download and extract this into the themes directory.
- Creates a MySQL database.
- Creates new Wordpress Salts and enters them into wp-config-sample.php along with the database information and renames it to wp-config.php
- ~~Removes itself after it has finished installing wordpress. ~~ at the moment this is having issues. Just remove node_modules folder after install has finished.

**See Todo for future plans**


## Install

```sh
$ npm install wpauto
```

## Todo

* Create development environment if the users wishes (Custom package.json for css/scss and js prefixing and minifications)
* Plugin Installs
* Database imports/exports
* SSH/SFTP upload to live server with files database with a search and replace of the database for the domain name.

[npm-image]: https://img.shields.io/npm/v/wpauto.svg
[npm-url]: https://npmjs.org/package/wpauto
[node-version-image]: https://img.shields.io/node/v/wpauto.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://img.shields.io/travis/michaelmano/node-wpauto/master.svg?label=linux
[travis-url]: https://travis-ci.org/michaelmano/node-wpauto
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/node-wpauto/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/node-wpauto
[coveralls-image]: https://img.shields.io/coveralls/michaelmano/node-wpauto/master.svg
[coveralls-url]: https://coveralls.io/r/michaelmano/node-wpauto?branch=master
[downloads-image]: https://img.shields.io/npm/dm/wpauto.svg
[downloads-url]: https://npmjs.org/package/wpauto
