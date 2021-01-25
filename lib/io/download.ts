import {TraceDataWithXml} from 'lib/io/getTraces';

export function downloadXml(trace: TraceDataWithXml) {
    const asText = new XMLSerializer().serializeToString(trace.xml)
    const embededUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(asText)
    download(trace.origFilename, embededUrl)
}

export function download(filename: string, url: string) {
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


export async function  downloadXmlFull(trace: TraceDataWithXml) {
    const url = await (await fetch(`api/getFullFileUrl?id=${trace._id}`)).text()
    console.log('downloading ' + url);
    download(trace.origFilename, url)
}
