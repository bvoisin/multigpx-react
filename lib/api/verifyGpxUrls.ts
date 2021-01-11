import {TraceData, withDao} from 'lib/api/MongoDao';
import {loginToAws} from 'pages/api/loginToAws';
import * as aws from 'aws-sdk';
import {getS3FileName} from 'lib/api/s3filesOrganization';

const signedUrlExpires = 60 * 60; // 24h
const minExpirationDelay = 60 * 60; // 1h

export function verifyGpxUrls(t: TraceData) {
    const now = Date.now();

    if (t.tempGpxUrl && t.tempGpxUrlExpiry.valueOf() > now + minExpirationDelay * 1000) {
        return Promise.resolve(t);
    } else {
        const fileName = getS3FileName(t);

        loginToAws();
        const s3 = new aws.S3();
        return s3.getSignedUrlPromise('getObject', {Bucket: process.env.MY_AWS_BUCKET_NAME, Key: fileName, Expires: signedUrlExpires})
            .then(async downloadUrl => {
                console.log('Updating tempGpxUrl')
                const newTraceData: TraceData = {...t, tempGpxUrl: downloadUrl, tempGpxUrlExpiry: new Date(now + signedUrlExpires * 1000)}
                await withDao(dao => dao.updateTraceData(newTraceData));
                return newTraceData;
            });
    }
}