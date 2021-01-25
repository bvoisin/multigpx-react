import {TraceData} from 'lib/api/MongoDao';
import {fixTraceName} from 'lib/gpx/parseToGpxFileInfo';

export interface TraceDataWithXml extends TraceData {
    xml: Document;
}

async function addXml(traceData: TraceData): Promise<TraceDataWithXml> {
    try {
        const response = await fetch(traceData.tempSmallGpxUrl);
        if (response.status !== 200) {
            console.warn('Error ' + response.status + ' ' + response.statusText + ' while loading trace ' + traceData._id);
            return null;
        }
        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, 'text/xml');
        const traceName = fixTraceName(traceData.traceName, traceData.origFilename)
        return {...traceData, xml, traceName};
    } catch (e) {
        console.warn('Error while loading trace ' + traceData._id, e);
        return null;
    }
}

export function getTraces(directory: string): Promise<TraceDataWithXml[]> {
    return fetch(`api/getTraces?directory=${directory}`)
        .then(res => res.json())
        .then(traces => Promise.all<TraceDataWithXml>(traces.map(addXml)))
        .then(tracesWithXml => tracesWithXml.filter(t => !!t))
}

export async function getTrace(_id: string): Promise<TraceDataWithXml> {
    return fetch(`/api/getTrace?id=${_id}`)
        .then(r => r.json())
        .then(addXml);
}
