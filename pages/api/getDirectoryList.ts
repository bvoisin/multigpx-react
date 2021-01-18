import {NextApiRequest, NextApiResponse} from 'next';
import {DirectoryInfo, withDao} from 'lib/api/MongoDao';


async function listDirectories$(): Promise<DirectoryInfo[]> {
    return withDao(async dao => {
        return await dao.getDirectoryInfos()
    });
}

// noinspection JSUnusedGlobalSymbols
export default async function handler(request: NextApiRequest, res: NextApiResponse<DirectoryInfo[]>) {
    // res.status(200).json(['a', 'b']);
    const dirList = await listDirectories$()
    res.status(200).json(dirList);
};