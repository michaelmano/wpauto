# wpauto

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

## Table of Contents

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Install](#install)
- [Todo](#todo)


## Introduction

WPAuto is a global node package which sets up new WordPress project which is easily managed and version controlled, It also sets up the MySQL database if you have set the host to local and provided the correct details.
At the moment this only works on linux and MAC and has not been developed for windows environments. I will work on that later.

## Requirements

WPAuto requires that you have the following installed:

* Node v8 and above.
* Git
* Composer
* PHP
* NPM

and only runs on operating systems that use Bash.

## Install
First install wpauto globally by running `npm install -g wpauto` and then you can use it by typing `wpauto` or by passing it the directory you wish to set the project up in `wpauto ~/Development/new-project`

## Todo

* Test and refactor for windows environments.
* Allow user to add plugins to the project.
* Allow the user to select a different theme.

[npm-image]: https://img.shields.io/npm/v/wpauto.svg
[npm-url]: https://npmjs.org/package/wpauto
[downloads-image]: https://img.shields.io/npm/dm/wpauto.svg
[downloads-url]: https://npmjs.org/package/wpauto
