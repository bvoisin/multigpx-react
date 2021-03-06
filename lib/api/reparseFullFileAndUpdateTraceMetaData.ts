import {TraceMetaData, withDao} from 'lib/api/MongoDao';
import * as aws from 'aws-sdk';
import {getS3FileName} from 'lib/api/s3filesOrganization';
import {omitNullEntries, parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';

export default function reparseFullFileAndUpdateTraceMetaData(_id: string) {
    return withDao(async dao => {
        const dbData = await dao.fetchTraceData(_id)
        const s3 = new aws.S3();
        const fullFileName = getS3FileName(dbData, 'small');

        const s3Data: any = await s3.getObject({Bucket: process.env.MY_AWS_BUCKET_NAME, Key: fullFileName}).promise()
        const text = s3Data.Body.toString('utf-8');

        const parsedData = parseToGpxFileInfo(text, dbData.directory, dbData.origFilename)
        console.log('Parsed ' + _id, parsedData);


        const updatedData = {...parsedData, ...omitNullEntries(dbData)} as TraceMetaData; // keep the data filled in the Database
        delete updatedData['parsedData'];
        delete updatedData['xml'];
        console.log('Updating ' + _id, updatedData);
        await dao.updateTraceData(updatedData);
    });
}