import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';
import {withDao} from 'lib/api/MongoDao';
import {getS3FileName} from 'lib/api/s3filesOrganization';

export interface NewTraceQuery {
    origFilename: string;
    directory: string;
}

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

async function handler(req: NextApiRequest & { query: NewTraceQuery }, res: NextApiResponse<NewTraceResponse>) {
    loginToAws();

    const {origFilename, directory} = req.query
    if (!origFilename.match(/[^\/\\]+.gpx/)) {
        res.status(400).write(`Bad fileName '$fileName'. Must end with .gpx and must not contain special characters(/)`);
    }

    await withDao(async dao => {
        const _id = (await dao.createNewTraceData(directory, origFilename))._id;

        console.log(`creating Upload URL for '${_id}_${origFilename}'`)
        const s3 = new aws.S3();
        const traceInfo = {_id, origFilename, directory};
        const fullFilePresignedPost = await getPresignedUrl(s3, getS3FileName(traceInfo, 'full'), 10 * 1024 * 1024);
        const smallFilePresignedPost = await getPresignedUrl(s3, getS3FileName(traceInfo, 'small'), 100 * 1024);
        res.status(200).json({fullFilePresignedPost, smallFilePresignedPost, _id: _id});
    })
}

// noinspection JSUnusedGlobalSymbols
export default handler