import {NextApiRequest} from 'next';

export function getFilePrefix(request: NextApiRequest) {
    const dir = request.query.directory

    if (dir && typeof dir !== 'string' || dir === 'undefined' || dir === 'null') {
        throw new Error(`Bad parameter '${dir}'`)
    }
    const dir2 = dir as string || process.env.DEFAULT_DIR

    console.log('getFilePrefix', {dir, dir2})

    if (!dir2.match(/^[^\/]+$/)) {
        throw new Error(`Bad directory '${dir2}'`)
    }

    return process.env.DIR_PREFIX + dir2 + '/';
}