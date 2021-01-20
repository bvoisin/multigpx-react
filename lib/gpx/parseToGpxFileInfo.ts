import {TraceMetaData} from '../api/MongoDao';
import * as sax from 'sax';
import {checkEquals} from 'lib/checks';

// async function getGpxXmlText(gpxFileUrl: TraceData | File): Promise<{ doc: Document, fileName: string }> {
//     if (gpxFileUrl instanceof File) {
//         const text = await gpxFileUrl.text();
//         return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.name};
//     } else {
//         const text = await (await fetch(gpxFileUrl.tempSmallGpxUrl)).text();
//         return {doc: new DOMParser().parseFromString(text, 'text/xml'), fileName: gpxFileUrl.origFileName};
//     }
// }

export function fixTraceName(readTraceName: string, origFileName: string) {
    return readTraceName && readTraceName != 'Move' ? readTraceName : origFileName.replace('.gpx', '');
}

const traceNameStack = ['gpx', 'metadata', 'name']
const athleteNameStack = ['gpx', 'metadata', 'author', 'name']
const linkStack = ['gpx', 'metadata', 'link']

export function parseToGpxFileInfo(fileContent: string, directory: string, origFileName: string) {
    const parser = sax.parser(true, {trim: true});

    let readTraceName: string = undefined
    let athleteName: string = undefined
    let link: string = undefined

    const currentStack = [];

    function isCurrentStack(stack: string[]) {
        if (stack.length !== currentStack.length) {
            return false;
        }
        for (let i = stack.length - 1; i >= 0; i--) {
            if (currentStack[i] !== stack[i]) {
                return false;
            }
        }
        return true;
    }

    let currentText: string;
    parser.onopentag = ({name, attributes}) => {
        currentStack.push(name)
        currentText = '';
        switch (name) {
            case 'link':
                if (isCurrentStack(linkStack)) {
                    link = attributes['href'] as string;
                }
        }
    }
    parser.onclosetag = name => {
        switch (name) {
            case 'name':
                if (isCurrentStack(traceNameStack)) {
                    readTraceName = currentText
                } else if (isCurrentStack(athleteNameStack)) {
                    athleteName = currentText
                }
                break
        }
        const v = currentStack.pop()
        checkEquals(name, v);
    }
    parser.ontext = text => {
        currentText += text;
    }

    parser.write(fileContent);

    return {origFileName, athleteName, traceName:fixTraceName(readTraceName, origFileName), link, directory} as TraceMetaData;
}

// export function updateGpxMetaInfo(f: GpxFileInfo, values: Partial<GpxFileInfo>): Promise<GpxFileInfo> {
//     function setValue(xPath: string, v: string) {
//         if (v !== undefined) {
//             const node: Node = f.doc.evaluate(xPath, f.doc, GPX_NS_RESOLVER, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//             if (node != null) {
//                 node.textContent = v;
//             } else {
//                 const paths = xPath.replace(/^\/g:gpx\//, '').split('/')
//                 let currentNode: Element = f.doc.documentElement;
//                 for (const p of paths) {
//                     if (p.startsWith('g:')) {
//                         const elName = p.substring(2);
//                         let el = currentNode.getElementsByTagName(elName).item(0);
//                         if (!el) {
//                             el = f.doc.createElementNS(GPX_NS, elName)
//                             currentNode.appendChild(el);
//                         }
//                         currentNode = el;
//                     } else if (p.startsWith('@')) {
//                         const attName = p.substring(1);
//                         if (v) {
//                             currentNode.setAttribute(attName, v);
//                         } else {
//                             currentNode.removeAttribute(attName)
//                         }
//                         return;
//                     }
//                 }
//                 currentNode.textContent = v;
//             }
//         }
//     }
//
//     setValue(athleteNameXPath, values.athleteName);
//     setValue(traceNameXPath, values.traceName);
//     setValue(linkXPath, values.link);
//     const newFile = parseToGpxFileInfo(f.doc, f.fileDirectory, f.fileName);
//     const asText = new XMLSerializer().serializeToString(f.doc)
//
//     console.log('New doc ', {newFile, asText});
//     return uploadGpxText(f.fileName, f.fileDirectory, asText).then(() => newFile);
// }
