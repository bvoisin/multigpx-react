import {TraceDataWithXml} from 'lib/io/getTraces';

export function addTraceToList(lst: TraceDataWithXml[], newTrace: TraceDataWithXml) {
    return [...removeTrace(lst, newTrace._id), newTrace];
}
export function removeTrace(lst: TraceDataWithXml[], id: string) {
    return lst.filter(f => f._id !== id);
}