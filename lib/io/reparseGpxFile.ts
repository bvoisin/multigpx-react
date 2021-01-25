import {obj2QueryParams} from 'lib/io/uploadTrace';

export async function reparseGpxFile(_id: string): Promise<string> {
    const obj = {_id};
    return await (await fetch(`/api/reparseGpxFile?${obj2QueryParams(obj)}`)).text();
}