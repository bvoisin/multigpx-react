import {TraceData} from 'lib/api/MongoDao';
import {obj2QueryParams} from 'lib/io/uploadTrace';


export async function updateTrace(trace: TraceData & { _id: string }): Promise<string> {

    const traceAsQueryParams = obj2QueryParams(trace);

    const response: string = await (await fetch(`/api/updateTraceMetaData?${traceAsQueryParams}`)).text();
    console.log(`update trace ${trace.traceName} => ${response}`)

    return response;
}