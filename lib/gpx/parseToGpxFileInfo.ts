import {GpxFileRef} from 'pages/api/getGpxFileList';
import {uploadGpxText} from 'lib/io/upload';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';

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
const GPX_NS = 'http://www.topografix.com/GPX/1/1';
const GPX_NS_RESOLVER = () => GPX_NS;


export function parseToGpxFileInfo(doc: Document, fileDirectory: string, fileName: string) {
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


    return new GpxFileInfo(fileDirectory, fileName, doc, traceName, athleteName, link);
}

export async function parseToGpxFileInfo2(gpxFileUrl: GpxFileRef | File, fileDirectory: string): Promise<GpxFileInfo> {
    const f = await getGpxXmlText(gpxFileUrl);
    const doc = f.doc;

    return parseToGpxFileInfo(doc, fileDirectory, f.fileName);
}

export function updateGpxMetaInfo(f: GpxFileInfo, values: Partial<GpxFileInfo>): Promise<GpxFileInfo> {
    function setValue(xPath: string, v: string) {
        if (v !== undefined) {
            const node: Node = f.doc.evaluate(xPath, f.doc, GPX_NS_RESOLVER, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (node != null) {
                node.textContent = v;
            } else {
                const paths = xPath.replace(/^\/g:gpx\//, '').split('/')
                let currentNode: Element = f.doc.documentElement;
                for (const p of paths) {
                    if (p.startsWith('g:')) {
                        const elName = p.substring(2);
                        let el = currentNode.getElementsByTagName(elName).item(0);
                        if (!el) {
                            el = f.doc.createElementNS(GPX_NS, elName)
                            currentNode.appendChild(el);
                        }
                        currentNode = el;
                    } else if (p.startsWith('@')) {
                        const attName = p.substring(1);
                        if (v) {
                            currentNode.setAttribute(attName, v);
                        } else {
                            currentNode.removeAttribute(attName)
                        }
                        return;
                    }
                }
                currentNode.textContent = v;
            }
        }
    }

    setValue(athleteNameXPath, values.athleteName);
    setValue(traceNameXPath, values.traceName);
    setValue(linkXPath, values.link);
    const newFile = parseToGpxFileInfo(f.doc, f.fileDirectory, f.fileName);
    const asText = new XMLSerializer().serializeToString(f.doc)

    console.log('New doc ', {newFile, asText});
    return uploadGpxText(f.fileName, f.fileDirectory, asText).then(() => newFile);
}
