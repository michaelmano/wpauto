import https from 'https';

/**
 * Downloads the requested url and returns it as a string.
 * @param {string} url
 * @return {promise}
 */
const download = function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            res.on('data', (data) => {
                return resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

export default download;
