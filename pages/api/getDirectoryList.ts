import * as aws from 'aws-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {loginToAws} from 'pages/api/loginToAws';

export interface DirectoryInfo {
    name: string;
}

async function listDirectories$(): Promise<DirectoryInfo[]> {
    if (process.env.NO_FILES) {
        return Promise.resolve([{name: 'singleFakeDir'}]);
    } else {
        return new Promise<DirectoryInfo[]>((resolve) => {
            loginToAws();
            const s3 = new aws.S3();
            s3.listObjects({Prefix: '', Delimiter: '/', Bucket: process.env.MY_AWS_BUCKET_NAME}, function (err, data) {
                const ret = data.CommonPrefixes
                    .map(f => f.Prefix)
                    .filter(key => !key.startsWith('_'))
                    .map(key => ({name: key}));
                // console.log('listDirectories$', {err, data, ret})

                resolve(ret)
            });
        });
    }
}

export default async function handler(request: NextApiRequest, res: NextApiResponse<DirectoryInfo[]>) {
    // res.status(200).json(['a', 'b']);
    const dirList = await listDirectories$()
    // console.log(`dirList`, {fileList: dirList})
    res.status(200).json(dirList);
};