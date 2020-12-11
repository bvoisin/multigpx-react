import {GpxFileRef} from 'pages/api/getGpxFileList';
import {GpxFileInfo} from 'pages';

async function getGpxXmlText(gpxFileUrl: GpxFileRef | File): Promise<{ doc: Document, fileName: string }> {
    if (gpxFileUrl instanceof File) {
        const text = await gpxFileUrl.text();
        return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.name};
    } else {
        const text = await (await fetch(gpxFileUrl.downloadUrl)).text();
        return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.fileName};
    }
}

export function parseToGpxFileInfo(doc: Document, fileName: string) {
    let getStringValue = function (expression: string, nameToWarnIfEmpty?: string) {
        let v = doc.evaluate(expression, doc, () => 'http://www.topografix.com/GPX/1/1', XPathResult.STRING_TYPE, null).stringValue;
        if (!v && nameToWarnIfEmpty) {
            console.log(`No value for ${nameToWarnIfEmpty} on ${fileName}`)
        }
        return v;
    };
    const athleteName = getStringValue('/g:gpx/g:metadata/g:author/g:name/text()', 'athleteName');
    const traceName = getStringValue('/g:gpx/g:trk/g:name/text()', 'traceName');
    const link = getStringValue('/g:gpx/g:metadata/g:link/@href');


    return new GpxFileInfo(fileName, doc, traceName, athleteName, link);
}

export async function parseToGpxFileInfo2(gpxFileUrl: GpxFileRef | File): Promise<GpxFileInfo> {
    const f = await getGpxXmlText(gpxFileUrl);
    const doc = f.doc;

    return parseToGpxFileInfo(doc, f.fileName);
}
