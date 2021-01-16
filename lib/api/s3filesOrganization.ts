import {TraceData} from 'lib/api/MongoDao';

export function getFilePrefix(directory: string) {
    if (directory && typeof directory !== 'string') {
        throw new Error(`Bad parameter '${directory}'`)
    }
    const dir2 = directory as string

    if (!dir2.match(/^[^\/]+$/)) {
        throw new Error(`Bad directory '${dir2}'`)
    }

    return process.env.DIR_PREFIX + dir2 + '/';
}

export function getS3FileName(traceData: TraceData, suffix: string) {
    return getFilePrefix(traceData.directory) + traceData._id + '_' + suffix + '_' + traceData.origFileName;
}
