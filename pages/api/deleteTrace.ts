import {NextApiRequest, NextApiResponse} from 'next';
import {deleteTrace} from 'lib/api/deleteTrace';


interface DeleteTraceParams {
    id: string;
}


async function handler(request: NextApiRequest & { query: DeleteTraceParams }, res: NextApiResponse<string>) {
        await deleteTrace(request.query.id)
        res.status(200).write('Done');
}

// noinspection JSUnusedGlobalSymbols
export default handler