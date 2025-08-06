import mongoose from "mongoose";
import { loadModels } from "@/models/modelLoader";

const MONGODB_URI = process.env.MONGODB_URI!;

interface CachedConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: CachedConnection | undefined;
}

global.mongoose ||= { conn: null, promise: null };

const cached = global.mongoose;

export async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            dbName: "blog-next",
        };

        mongoose.set("strictQuery", false); // Optional: silences deprecation warning
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ Connected to MongoDB");
        await loadModels();
        return cached.conn;
    } catch (error) {
        console.error("⚠️ MongoDB connection error:", (error as Error).stack || error);
        cached.promise = null;
        throw error;
    }
}
