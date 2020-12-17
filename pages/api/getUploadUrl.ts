import * as aws from 'aws-sdk';
import {S3} from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';
import {getFilePrefix} from 'lib/api/getFilePrefix';

export default async function handler(req: NextApiRequest, res: NextApiResponse<S3.PresignedPost>) {
    loginToAws();

    const fileName = req.query.file.toString();
    if (!fileName.match(/[^\/\\]+.gpx/)) {
        res.status(400).write(`Bad fileName '$fileName'. Must end with .gpx and must not contain special characters`);
    }
    const filePrefix = getFilePrefix(req)
    const s3 = new aws.S3();
    const filePath = filePrefix + fileName;
    console.log(`created Upload URL for '${filePath}'`)

    const post = await s3.createPresignedPost({
        Bucket: process.env.MY_AWS_BUCKET_NAME,
        Fields: {
            key: filePath,
        },
        Expires: 60, // seconds
        Conditions: [
            ['content-length-range', 0, 1048576], // up to 1 MB
        ],
    });

    res.status(200).json(post);
}
