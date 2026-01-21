import crypto from 'node:crypto';

import { MongoClient } from 'mongodb';

const getUser = async (): Promise<{ username: string; passwordHash: string; }> => {

    const username = await rl.question('What will be the username?\n> ');
    const password = await rl.question('What will be the password?\n> ');
    
    console.log('The process of hashing the password will begin. Do not be afraid if the installer looks frozen.');
    
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
    
    return { username, passwordHash };
}

const createOwnerUser = async () => {
    const user = { ...await getUser(), role: 'owner' };

    const client = new MongoClient(envVariables.MONGODB_URI!);

    const db = client.db();
    const collection = db.collection('users');

    await collection.insertOne(user);

    await client.close();
};

export default createOwnerUser;