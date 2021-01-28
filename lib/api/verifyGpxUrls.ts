import {TraceData, withDao} from 'lib/api/MongoDao';
import {loginToAws} from 'pages/api/loginToAws';
import * as aws from 'aws-sdk';
import {getS3FileName} from 'lib/api/s3filesOrganization';

const signedUrlExpires = 60 * 60; // 24h
const minExpirationDelay = 60 * 60; // 1h

export function getPresignedUrl(t: TraceData, suffix: 'full' | 'small') {
    const fileName = getS3FileName(t, suffix);

    loginToAws();
    const s3 = new aws.S3();

    console.log('Fetching new tempGpxUrl for ' + fileName)
    return s3.getSignedUrlPromise('getObject', {Bucket: process.env.MY_AWS_BUCKET_NAME, Key: fileName, Expires: signedUrlExpires});
}

export async function verifyGpxUrls(t: TraceData) {
    const now = Date.now();

    if (!process.env.FORCE_NEW_URLS && t.tempSmallGpxUrl && t.tempSmallGpxUrlExpiry.valueOf() > now + minExpirationDelay * 1000) {
        return Promise.resolve(t);
    } else {
        const downloadUrl = await getPresignedUrl(t, 'small');
        const newTraceData: TraceData = {...t, tempSmallGpxUrl: downloadUrl, tempSmallGpxUrlExpiry: new Date(now + signedUrlExpires * 1000)}
        await withDao(dao => dao.updateTraceData(newTraceData));
        return newTraceData;
    }
}