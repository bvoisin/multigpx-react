import * as aws from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from './loginToAws';

export interface GpxFileRef {
    fileName: string;
    downloadUrl: string;
}

export type GpxFileRefs = GpxFileRef[];

async function listFiles$(): Promise<GpxFileRefs> {
    if (process.env.NO_FILES) {
        return Promise.resolve([]);
    } else {
        return new Promise<GpxFileRef[]>((resolve) => {
            loginToAws();
            const s3 = new aws.S3();
            s3.listObjects({Delimiter: '/', Prefix: process.env.FILE_PREFIX, Bucket: process.env.BUCKET_NAME}, function (err, data) {
                console.log('data ', {err, data})
                const fileList$ = data.Contents
                    .map(f => f.Key)
                    .filter(key => key.endsWith('.gpx'))
                    .map(key =>
                        s3.getSignedUrlPromise('getObject', {Bucket: process.env.BUCKET_NAME, Key: key})
                            .then(url => ({fileName: key, downloadUrl: url} as GpxFileRef))
                    )
                resolve(Promise.all(fileList$))
            });
        });
    }
}

export default async (_: NextApiRequest, res: NextApiResponse<GpxFileRefs>) => {
    // res.status(200).json(['a', 'b']);
    const fileList = await listFiles$()
    console.log('lst ', {fileList})
    res.status(200).json(fileList);
};