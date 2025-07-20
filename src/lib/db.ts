import mongoose from "mongoose";
import { loadModels } from "@/models/modelLoader";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    console.log("Mongodb URI :", MONGODB_URI);
    // throw new Error("⚠️ MONGODB_URI not defined in .env.local");
}

interface CachedConnection {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
}

let cached = (global as { mongoose?: CachedConnection }).mongoose;
if (!cached) {
    cached = (global as { mongoose?: CachedConnection }).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    if (!cached) {
        throw new Error("Cached mongoose connection is undefined.");
    }
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            dbName: "blog-next"
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ Connected to MongoDB");

        // Load models after successful connection
        await loadModels();

        return cached.conn;
    } catch (error) {
        console.error("⚠️ MongoDB connection error:", error);
        cached.promise = null;
        throw error;
    }
}