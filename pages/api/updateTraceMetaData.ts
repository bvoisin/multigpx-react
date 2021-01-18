import {NextApiRequest, NextApiResponse} from 'next';
import {TraceMetaData, withDao} from 'lib/api/MongoDao';

// noinspection JSUnusedGlobalSymbols
export default async function handler(req: NextApiRequest & { query: TraceMetaData & { _id: string } }, res: NextApiResponse<string>) {
    const traceData = req.query
    await withDao(async dao => {
        await dao.updateTraceData(traceData)
    });
    res.status(200).send('Ok');
}
