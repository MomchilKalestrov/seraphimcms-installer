import crypto from 'node:crypto';

import { MongoClient } from 'mongodb';


const hashPassword = async (password: string): Promise<string> => {
    const algorithm = 'argon2id';
    const nonce = crypto.randomBytes(16);
    const parallelism = 4;
    const tagLength = 32;
    const memory = 65536;
    const passes = 3;
    
    const hash = crypto.argon2Sync(algorithm, {
        message: password,
        nonce,
        parallelism,
        tagLength,
        memory,
        passes
    });
    
    //@ts-ignore
    const passwordHash = `$${ algorithm }$v=19$m=${ memory },t=${ passes },p=${ parallelism }$${ nonce.toBase64({ omitPadding: true }) }$${ hash.toBase64({ omitPadding: true }) }`;
    
    return passwordHash;
};

const createOwnerUser = async (username: string, password: string) => {
    const user = {
        username,
        passwordHash: hashPassword(password),
        role: 'owner'
    };
    
    const client = new MongoClient(globalThis.envVars.MONGODB_URI!);

    const db = client.db();
    const collection = db.collection('users');

    await collection.insertOne(user);

    await client.close();
};

export default createOwnerUser;