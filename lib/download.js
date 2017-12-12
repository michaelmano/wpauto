'use strict';

var https = require('https');

/**
 * Downloads the requested url and returns it as a string.
 * @param {string} url
 * @return {promise}
 */
var download = function download(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            res.on('data', function (data) {
                return resolve(data);
            });
        }).on('error', function (error) {
            reject(error);
        });
    });
};

module.exports = download;