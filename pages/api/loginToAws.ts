import * as aws from 'aws-sdk';

export function loginToAws() {
    aws.config.update({
        accessKeyId: process.env.MY_AWS_ACCESS_KEY,
        secretAccessKey: process.env.MY_AWS_SECRET_KEY,
        region: process.env.MY_AWS_REGION,
        signatureVersion: 'v4',
    });
}