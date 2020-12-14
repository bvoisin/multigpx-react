import {NextApiRequest} from 'next';

export function getFilePrefix(request: NextApiRequest) {
    const dir = request.query.directory

    if (dir && typeof dir !== 'string') {
        throw new Error(`Bad parameter '${dir}'`)
    }
    const dir2 = dir as string

    console.log('getFilePrefix', {dir, dir2})

    if (!dir2.match(/^[^\/]+$/)) {
        throw new Error(`Bad directory '${dir2}'`)
    }

    return process.env.DIR_PREFIX + dir2 + '/';
}