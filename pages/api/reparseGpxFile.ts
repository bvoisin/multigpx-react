import {NextApiRequest, NextApiResponse} from 'next';
import reparseFullFileAndUpdateTraceMetaData from 'lib/api/reparseFullFileAndUpdateTraceMetaData';

/**
 * To bue used for support operations
 *
 * Currently the same as newTraceUploaded
 * @param req
 * @param res
 */
// noinspection JSUnusedGlobalSymbols
export default async function handler(req: NextApiRequest & { query: { _id: string } }, res: NextApiResponse<string>) {
    const _id = req.query._id;
    await reparseFullFileAndUpdateTraceMetaData(_id)
    res.status(200).send('Ok');
}
