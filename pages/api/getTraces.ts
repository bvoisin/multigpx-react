import {NextApiRequest, NextApiResponse} from 'next';
import {TraceData, withDao} from 'lib/api/MongoDao';
import {verifyGpxUrls} from 'lib/api/verifyGpxUrls';


interface GetTracesParams {
    directory: string;
}


async function handler(request: NextApiRequest & { query: GetTracesParams }, res: NextApiResponse<TraceData[]>) {
    return withDao(async dao => {
        const traceDatas = await dao.fetchTraceDatas(request.query.directory)

        const augmentedTraceData$s: Promise<TraceData>[] = traceDatas.map(t => {
            return verifyGpxUrls(t);
        });
        const augmentedTraceDatas = await Promise.all(augmentedTraceData$s);
        res.status(200).json(augmentedTraceDatas);
    })
}

export default handler;