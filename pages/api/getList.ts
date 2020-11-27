import * as aws from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';

export interface GpxFileInfo {
    key: string;
    url: string;
}

export type GpxFileList = GpxFileInfo[];

async function listFiles$(): Promise<GpxFileList> {
    return new Promise<GpxFileInfo[]>((resolve, reject) => {
        aws.config.update({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_KEY,

            region: process.env.REGION,
            signatureVersion: 'v4',
        });

        const s3 = new aws.S3();
        s3.listObjects({Delimiter: '/', Prefix: process.env.FILE_PREFIX, Bucket: process.env.BUCKET_NAME}, function (err, data) {
            console.log('data ', {err, data})
            const fileList$ = data.Contents
                .map(f => f.Key)
                .filter(key => key.endsWith('.gpx'))
                .map(key =>
                    s3.getSignedUrlPromise('getObject', {Bucket: process.env.BUCKET_NAME, Key: key})
                        .then(url => ({key, url} as GpxFileInfo)))
            resolve(Promise.all(fileList$))
        });
    })
}

export default async (_: NextApiRequest, res: NextApiResponse) => {
    // res.status(200).json(['a', 'b']);
    const fileList = await listFiles$()
    console.log('lst ', {fileList})
    res.status(200).json(fileList);

};