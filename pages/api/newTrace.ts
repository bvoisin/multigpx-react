import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';
import {TraceData, TraceMetaData, withDao} from 'lib/api/MongoDao';
import {getS3FileName} from 'lib/api/s3filesOrganization';

export interface NewTraceResponse {
    presignedPost: S3.PresignedPost;
    _id: string;
}

async function handler(req: NextApiRequest & { query: TraceMetaData }, res: NextApiResponse<NewTraceResponse>) {
    loginToAws();

    const reqData = req.query
    const origFileName = reqData.origFileName;
    if (!origFileName.match(/[^\/\\]+.gpx/)) {
        res.status(400).write(`Bad fileName '$fileName'. Must end with .gpx and must not contain special characters(/)`);
    }

    await withDao(async dao => {
        const id = (await dao.saveNewTraceData(reqData))._id;

        const traceData: TraceData = {...reqData, _id: id};
        const s3 = new aws.S3();
        const filePath = getS3FileName(traceData)
        console.log(`creating Upload URL for '${filePath}'`)

        const post = await s3.createPresignedPost({
            Bucket: process.env.MY_AWS_BUCKET_NAME,
            Fields: {
                key: filePath,
            },
            Expires: 1200, // seconds
            Conditions: [
                ['content-length-range', 0, 1048576], // up to 1 MB
            ],
        });
        res.status(200).json({presignedPost: post, _id: id});
    })
}

export default handler