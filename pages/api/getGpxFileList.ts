import * as aws from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';
import {getFilePrefix} from 'lib/api/getFilePrefix';

export interface GpxFileRef {
    fileName: string;
    downloadUrl: string;
}

export type GpxFileRefs = GpxFileRef[];

async function listFiles$(fileNamePrefix: string): Promise<GpxFileRefs> {
    if (process.env.NO_FILES) {
        return Promise.resolve([]);
    } else {
        return new Promise<GpxFileRef[]>((resolve) => {
            loginToAws();
            const s3 = new aws.S3();
            s3.listObjects({Delimiter: '/', Prefix: fileNamePrefix, Bucket: process.env.MY_AWS_BUCKET_NAME}, function (err, data) {
                // console.log('data ', {err, data})
                const fileList$ = data.Contents
                    .map(f => f.Key)
                    .filter(key => key.endsWith('.gpx'))
                    .map(key => {
                            const fileName = key.substring(fileNamePrefix.length);
                            return s3.getSignedUrlPromise('getObject', {Bucket: process.env.MY_AWS_BUCKET_NAME, Key: key})
                                .then(downloadUrl => ({fileName, downloadUrl} as GpxFileRef));
                        }
                    )
                resolve(Promise.all(fileList$))
            });
        });
    }
}

export default async (request: NextApiRequest, res: NextApiResponse<GpxFileRefs>) => {
    // res.status(200).json(['a', 'b']);
    const filePrefix = getFilePrefix(request)
    const fileList = await listFiles$(filePrefix)
    // console.log(`lst ${filePrefix}:`, {fileList})
    res.status(200).json(fileList);
};