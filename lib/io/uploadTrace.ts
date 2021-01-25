import {reduceGpx} from 'lib/gpx/reduceGpx';
import * as _ from 'lodash';
import {NewTraceQuery, NewTraceResponse} from 'pages/api/newTrace';
import {S3} from 'aws-sdk';


export function obj2QueryParams(obj: any) {
    const toPairs: [string, string][] = _.toPairs(obj);
    return toPairs.map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&')
}

let uploadToS3 = async function (presignedPost: S3.PresignedPost, reducedDocText: string | File, _id: string, prefix: string) {
    const formData = new FormData();
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
    });
    formData.append('file', reducedDocText)

    const upload = await fetch(presignedPost.url, {
        method: 'POST',
        body: formData,
    });

    if (upload.ok) {
        console.log('Uploaded successfully! ' + _id + ' ' + prefix);
    } else {
        console.error('Upload failed. ' + _id + ' ' + prefix + ' ', presignedPost);
    }
};

export async function uploadTrace(file: File, directory: string): Promise<string> {
    const origFilename = encodeURIComponent(file.name);
    const req: NewTraceQuery = {directory, origFilename};
    const response: NewTraceResponse = await (await fetch(`/api/newTrace?${obj2QueryParams(req)}`)).json();
    const {_id, smallFilePresignedPost, fullFilePresignedPost} = response;
    console.log(`uploading files ${origFilename}`)

    const reducedDoc = await reduceGpx(file);
    const reducedDocText = new XMLSerializer().serializeToString(reducedDoc)

    await uploadToS3(smallFilePresignedPost, reducedDocText, _id, 'small');
    await uploadToS3(fullFilePresignedPost, file, _id, 'full');
    return _id;
}