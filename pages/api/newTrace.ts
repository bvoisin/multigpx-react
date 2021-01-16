import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';
import {TraceData, TraceMetaData, withDao} from 'lib/api/MongoDao';
import {getS3FileName} from 'lib/api/s3filesOrganization';

export interface NewTraceResponse {
    fullFilePresignedPost: S3.PresignedPost;
    smallFilePresignedPost: S3.PresignedPost;
    _id: string;
}

async function getPresignedUrl(s3: S3, filePath: string, maxSize = 1048576) {
    return s3.createPresignedPost({
        Bucket: process.env.MY_AWS_BUCKET_NAME,
        Fields: {
            key: filePath,
        },
        Expires: 1200, // seconds
        Conditions: [
            ['content-length-range', 0, maxSize], // up to 1 MB
        ],
    });
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

        console.log(`creating Upload URL for '${id}_${traceData.origFileName}'`)
        const fullFilePresignedPost = await getPresignedUrl(s3, getS3FileName(traceData, 'full'), 10 * 1024 * 1024);
        const smallFilePresignedPost = await getPresignedUrl(s3, getS3FileName(traceData, 'small'), 100 * 1024);
        res.status(200).json({fullFilePresignedPost, smallFilePresignedPost, _id: id});
    })
}

export default handler