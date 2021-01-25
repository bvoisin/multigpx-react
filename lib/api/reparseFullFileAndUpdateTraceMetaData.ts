import {withDao} from 'lib/api/MongoDao';
import * as aws from 'aws-sdk';
import {getS3FileName} from 'lib/api/s3filesOrganization';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';

export default function reparseFullFileAndUpdateTraceMetaData(_id: string) {
    return withDao(async dao => {
        const traceData = await dao.fetchTraceData(_id)
        const s3 = new aws.S3();
        const fullFileName = getS3FileName(traceData, 'small');

        const s3Data: any = await s3.getObject({Bucket: process.env.MY_AWS_BUCKET_NAME, Key: fullFileName}).promise()
        const text = s3Data.Body.toString('utf-8');

        const parsedData = parseToGpxFileInfo(text, traceData.directory, traceData.origFilename)
        console.log('Parsed ' + _id, parsedData);

        const updatedData = {...traceData, ...parsedData};
        delete updatedData['parsedData'];
        delete updatedData['xml'];
        console.log('Updating ' + _id, updatedData);
        await dao.updateTraceData(updatedData);
    });
}