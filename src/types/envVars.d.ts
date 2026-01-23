declare global {
    var envVars: {
        MONGODB_URI?: string | undefined;
        NEXTAUTH_URL?: string | undefined;
        BLOB_READ_WRITE_TOKEN?: string | undefined;
        NEXT_PUBLIC_BLOB_URL?: string | undefined;
        NEXTAUTH_SECRET?: string | undefined;
    };
};

export {};