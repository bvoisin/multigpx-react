import {TraceData} from 'lib/api/MongoDao';
import {obj2QueryParams} from 'lib/io/uploadTrace';
import {omitNullEntries} from 'lib/gpx/parseToGpxFileInfo';


export async function updateTrace(trace: TraceData & { _id: string }): Promise<string> {

    const interestingTraceData = omitNullEntries(trace);
    delete interestingTraceData['xml'];
    const traceAsQueryParams = obj2QueryParams(interestingTraceData);

    const response: string = await (await fetch(`/api/updateTraceMetaData?${traceAsQueryParams}`)).text();
    console.log(`update trace ${trace.traceName}`)

    return response;
}