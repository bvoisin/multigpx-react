import {TraceDataWithXml} from 'lib/io/getTraces';

export function downloadXml(trace: TraceDataWithXml) {
    const asText = new XMLSerializer().serializeToString(trace.xml)
    download(trace.origFileName, asText)
}

export function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
