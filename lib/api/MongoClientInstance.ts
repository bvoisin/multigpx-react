import {MongoClient} from 'mongodb';

const instance = new MongoClient(process.env.MONGO_URL, {useUnifiedTopology: true, maxPoolSize: 10});

export default instance;