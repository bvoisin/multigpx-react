import {NextApiRequest, NextApiResponse} from 'next';
import {TraceData, withDao} from 'lib/api/MongoDao';
import {verifyGpxUrls} from 'lib/api/verifyGpxUrls';


interface GetTraceParams {
    id: string;
}


async function handler(request: NextApiRequest & { query: GetTraceParams }, res: NextApiResponse<TraceData>) {
    return withDao(async dao => {
        const traceData = await dao.fetchTraceData(request.query.id)
        const traceData2 = await verifyGpxUrls(traceData)
        res.status(200).json(traceData2);
    });
}

// noinspection JSUnusedGlobalSymbols
export default handler