import {withDao} from 'lib/api/MongoDao';
import {loginToAws} from 'pages/api/loginToAws';
import * as aws from 'aws-sdk';
import {allFileSuffixes, getS3FileName} from 'lib/api/s3filesOrganization';

export function deleteFiles(...fileNames:string[]) {
    loginToAws();
    const s3 = new aws.S3();

    console.log('Deleting files ' + fileNames)
    return s3.getSignedUrlPromise('deleteObjects', {Bucket: process.env.MY_AWS_BUCKET_NAME, Delete: { Objects: fileNames.map(f => ({Key:f}))}});
}

export async function deleteTrace(traceId: string) {
    return withDao(async dao => {
        const trace = await dao.fetchTraceData(traceId);
        const fileKeys = allFileSuffixes.map(suffix => getS3FileName(trace, suffix));
        await deleteFiles(...fileKeys);
        await dao.deleteTraceData(traceId);
    })
}