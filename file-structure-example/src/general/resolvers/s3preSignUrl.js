const fromEvent = require('graphcool-lib').fromEvent;

function getSignedUrl(bucket, fileName) {
    const AWS                    = require('aws-sdk');
    const s3                     = new AWS.S3({
        region: 'us-east-1',
        signatureVersion: 'v4'
    });
    const signedUrlExpireSeconds = 60 * 5;

    AWS.config.update({
        accessKeyId    : process.env.VAR1,
        secretAccessKey: process.env.VAR2,
        region         : 'us-east-1'
    });

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('putObject', {
            Bucket : bucket,
            Key    : fileName,
            Expires: signedUrlExpireSeconds,
            ACL    : 'public-read'
        }, (err, url) => {
            if (err) {
                return reject(err);
            }

            resolve(url);
        })
    });
}

module.exports = function(event) {
    const {bucket, fileName} = event.data;

    return getSignedUrl(bucket, fileName)
        .then((url) => {
            return {
                data: {
                    url: url
                }
            }
        })
        .catch((e) => {
            return {
                error: e.message
            }
        });
};