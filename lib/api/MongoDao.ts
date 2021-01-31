import MongoClientInstance from 'lib/api/MongoClientInstance';
import {checkEquals} from 'lib/checks';
import {ObjectId} from 'bson';
import {MongoClient} from 'mongodb';
import {ParsedData} from 'lib/gpx/parseToGpxFileInfo';

export interface TraceDataBeforeCreation {
    origFilename: string;
    directory: string;
}

export interface TraceDataAtCreation extends TraceDataBeforeCreation {
    _id: string;
}

export interface TraceMetaData extends TraceDataAtCreation, ParsedData {
}

export interface TraceData extends TraceMetaData {
    tempSmallGpxUrl?: string;
    tempSmallGpxUrlExpiry?: Date;
}

export interface DirectoryInfo {
    name: string;
    nbTraces: number;
}

let cachedClient: MongoClient = null;

export class MongoDao {
    client: MongoClient

    async init(): Promise<this> {
        if (!cachedClient) {
            cachedClient = await MongoClientInstance.connect();
        }
        this.client = cachedClient;
        return this;
    }

    getCollection() {
        return this.client.db('multigpx').collection('traces');
    }

    async fetchTraceDatas(directory: string): Promise<TraceData[]> {
        const collection = this.getCollection();
        return await collection.find({directory: directory}).toArray();
    }

    async getDirectoryInfos(): Promise<DirectoryInfo[]> {
        const collection = this.getCollection();
        const lst = await collection.aggregate<{ _id: string, nbTraces: number }>([{
            $match: {
                directory: {$not: {$regex: '^_.*'}}
            }
        }, {
            $group: {
                _id: '$directory',
                nbTraces: {$sum: 1}
            }
        }]).toArray();
        return lst.map(a => ({name: a._id, nbTraces: a.nbTraces}));
    }

    async fetchTraceData(id: string): Promise<TraceData> {
        const collection = this.getCollection();
        const trace = await collection.findOne({_id: new ObjectId(id)});
        if (trace == null) {
            throw new Error('Unknown trace ' + id);
        }
        return trace;
    }

    async createNewTraceData(directory: string, origFilename: string): Promise<TraceDataAtCreation> {
        const collection = this.getCollection();
        const newTraceData: TraceDataBeforeCreation = {directory, origFilename}
        const result = await collection.insertOne(newTraceData);
        return {_id: result.insertedId, ...newTraceData};
    }

    async updateTraceData(newTraceData: TraceData): Promise<TraceData> {
        const collection = this.getCollection();
        const id = newTraceData._id;
        const _id = new ObjectId(id);
        const result = await collection.replaceOne({_id}, {...newTraceData, _id});
        checkEquals(1, result.matchedCount, 'while saving ' + id + ' ' + result);
        if (result.modifiedCount == 0) {
            console.log('The trace MetaData was already at this state:', newTraceData)
        } else {
            console.log('Updated trace MetaData to:', newTraceData)
        }
        return newTraceData;
    }

    async close() {
        this.client = null;
        // it seems that we should not close the client, but keep it opened (single Instance)...
        // return this.client.close();
    }

    async deleteTraceData(traceId: string) {
        const collection = this.getCollection();
        const _id = new ObjectId(traceId);
        const result = await collection.deleteOne({_id})
        checkEquals(1, result.deletedCount, 'while deleting ' + _id + ' ' + result);
        console.log('Deleted trace ' + _id, result)
    }
}

export async function withDao<T>(fn: (dao: MongoDao) => Promise<T>): Promise<T> {
    const dao = await new MongoDao().init();
    try {
        return await fn(dao);
    } finally {
        await dao.close();
    }
}