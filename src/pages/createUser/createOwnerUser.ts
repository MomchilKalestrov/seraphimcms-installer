import argon2 from 'argon2';
import { MongoClient } from 'mongodb';

const createOwnerUser = async (username: string, password: string) => {
    const user = {
        username,
        passwordHash: argon2.hash(password),
        role: 'owner'
    };
    
    const client = new MongoClient(globalThis.envVars.MONGODB_URI!);

    const db = client.db();
    const collection = db.collection('users');

    await collection.insertOne(user);

    await client.close();
};

export default createOwnerUser;