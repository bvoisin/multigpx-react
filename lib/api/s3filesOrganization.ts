import _ from 'lodash';

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

export type PossibleFileSuffix = 'full' | 'small'

export function getS3FileName(traceData: { _id: string, origFilename: string, directory: string }, suffix: PossibleFileSuffix) {
    if (!traceData.origFilename || traceData.origFilename === 'undefined') {
        throw new Error('Bad traceData, no origFilename: ' + JSON.stringify(traceData))
    }
    return getFilePrefix(traceData.directory) + traceData._id + '_' + suffix + '_' + traceData.origFilename;
}
