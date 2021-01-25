import {NextApiRequest, NextApiResponse} from 'next';
import reparseFullFileAndUpdateTraceMetaData from 'lib/api/reparseFullFileAndUpdateTraceMetaData';

/**
 * To be called after the gpx (big and small) have been uploaded to S3
 * @param req
 * @param res
 */
// noinspection JSUnusedGlobalSymbols
export default async function handler(req: NextApiRequest & { query: { _id: string } }, res: NextApiResponse<string>) {
    const _id = req.query._id;
    await reparseFullFileAndUpdateTraceMetaData(_id)
    res.status(200).send('Ok');
}
