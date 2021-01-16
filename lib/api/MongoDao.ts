import MongoClientInstance from 'lib/api/MongoClientInstance';
import {checkEquals} from 'lib/checks';
import {ObjectId} from 'bson';
import {MongoClient} from 'mongodb';

export interface TraceMetaData {
    origFileName: string;
    athleteName: string;
    traceName: string;
    link: string;
    directory: string;
}

export interface TraceData extends TraceMetaData {
    _id: string;
    tempSmallGpxUrl?: string;
    tempSmallGpxUrlExpiry?: Date;
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

    async fetchTraceData(id: string): Promise<TraceData> {
        const collection = this.getCollection();
        const trace = await collection.findOne({_id: new ObjectId(id)});
        if (trace == null) {
            throw new Error('Unknown trace ' + id);
        }
        return trace;
    }

    async saveNewTraceData(newTraceData: TraceMetaData): Promise<TraceData> {
        checkEquals(undefined, newTraceData['_id']);
        const collection = this.getCollection();
        const result = await collection.insertOne(newTraceData);
        return {_id: result.insertedId, ...newTraceData};
    }

    async updateTraceData(newTraceData: TraceData): Promise<TraceData> {
        const collection = this.getCollection();
        const id = newTraceData._id;
        const result = await collection.replaceOne({_id: new ObjectId(id)}, {...newTraceData, _id: new ObjectId(id)});
        checkEquals(1, result.modifiedCount, 'while saving ' + id);
        return newTraceData;
    }

    async close() {
        this.client = null;
        // it seems that we should not close the client, but keep it opened...
        // return this.client.close();
    }
}

export async function withDao<T>(fn: (dao: MongoDao) => Promise<T>): Promise<T> {
    const dao = await new MongoDao().init();
    try {
        const ret = await fn(dao);
        console.log('Mongo ret', ret);
        return ret;
    } finally {
        console.log('Closing Mongo client');
        await dao.close();
    }
}