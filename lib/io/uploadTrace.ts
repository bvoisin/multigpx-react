import {reduceGpx} from 'lib/gpx/reduceGpx';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import * as _ from 'lodash';
import {NewTraceResponse} from 'pages/api/newTrace';


export function obj2QueryParams(obj: any) {
    const toPairs: [string, string][] = _.toPairs(obj);
    return toPairs.map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&')
}

export async function uploadTrace(file: File, directory: string): Promise<string> {
    const origFilename = encodeURIComponent(file.name);
    const reducedDoc = await reduceGpx(file);
    const reducedDocText = new XMLSerializer().serializeToString(reducedDoc)

    const trace = parseToGpxFileInfo(reducedDoc, directory, origFilename);

    const traceAsQueryParams = obj2QueryParams(trace);
    const response: NewTraceResponse = await (await fetch(`/api/newTrace?${traceAsQueryParams}`)).json();
    const {_id, presignedPost} = response;
    console.log(`uploading file ${origFilename} using presignedPost ${presignedPost}`)

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
        console.log('Uploaded successfully! ' + _id);
    } else {
        console.error('Upload failed. ' + _id);
    }
    return _id;
}