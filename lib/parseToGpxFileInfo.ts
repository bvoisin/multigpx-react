import {GpxFileRef} from 'pages/api/getGpxFileList';
import {uploadGpxText} from 'lib/upload';
import {GpxFileInfo} from 'lib/gpxFileInfo';

async function getGpxXmlText(gpxFileUrl: GpxFileRef | File): Promise<{ doc: Document, fileName: string }> {
    if (gpxFileUrl instanceof File) {
        const text = await gpxFileUrl.text();
        return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.name};
    } else {
        const text = await (await fetch(gpxFileUrl.downloadUrl)).text();
        return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.fileName};
    }
}

const athleteNameXPath = '/g:gpx/g:metadata/g:author/g:name';
const traceNameXPath = '/g:gpx/g:trk/g:name';
const linkXPath = '/g:gpx/g:metadata/g:link/@href';
const GPX_NS_RESOLVER = () => 'http://www.topografix.com/GPX/1/1';


export function parseToGpxFileInfo(doc: Document, fileName: string) {
    let getStringValue = function (expression: string, nameToWarnIfEmpty?: string) {
        let v = doc.evaluate(expression, doc, GPX_NS_RESOLVER, XPathResult.STRING_TYPE, null).stringValue;
        if (!v && nameToWarnIfEmpty) {
            console.log(`No value for ${nameToWarnIfEmpty} on ${fileName}`)
        }
        return v;
    };
    const athleteName = getStringValue(athleteNameXPath + '/text()', 'athleteName');
    const traceName = getStringValue(traceNameXPath + '/text()', 'traceName');
    const link = getStringValue(linkXPath);


    return new GpxFileInfo(fileName, doc, traceName, athleteName, link);
}

export async function parseToGpxFileInfo2(gpxFileUrl: GpxFileRef | File): Promise<GpxFileInfo> {
    const f = await getGpxXmlText(gpxFileUrl);
    const doc = f.doc;

    return parseToGpxFileInfo(doc, f.fileName);
}

export function updateGpxMetaInfo(f: GpxFileInfo, values: Partial<GpxFileInfo>, fileDirectory:string): Promise<GpxFileInfo> {
    function setValue(xPath: string, v: string) {
        if (v !== undefined) {
            const node = f.doc.evaluate(xPath, f.doc, GPX_NS_RESOLVER, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            node.textContent = v;
        }
    }

    setValue(athleteNameXPath, values.athleteName);
    setValue(traceNameXPath, values.traceName);
    setValue(linkXPath, values.link);
    const newFile = parseToGpxFileInfo(f.doc, f.fileName);
    const asText = new XMLSerializer().serializeToString(f.doc)

    console.log('New doc ', {newFile, asText});
    return uploadGpxText(f.fileName, asText, fileDirectory).then(() => newFile);
}
