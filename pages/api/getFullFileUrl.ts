import {NextApiRequest, NextApiResponse} from 'next';
import {withDao} from 'lib/api/MongoDao';
import {getPresignedUrl} from 'lib/api/verifyGpxUrls';


interface GetFullFileUrlParams {
    id: string;
}


/**
 * Returns a presigned URL to download the full file. Not cached as we rarely need this download
 * @param request
 * @param res
 */
async function handler(request: NextApiRequest & { query: GetFullFileUrlParams }, res: NextApiResponse<string>) {
    return withDao(async dao => {
        const id = request.query.id;
        console.log('getFullFileUrl ' + id)
        const traceData = await dao.fetchTraceData(id)
        const url = await getPresignedUrl(traceData, 'full')
        console.log('url : ' + url)
        res.status(200).json(url);
    });
}

export default handler