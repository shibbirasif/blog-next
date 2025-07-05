import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("⚠️ MONGODB_URI not defined in .env.local");
}

let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
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
        return cached.conn;
    } catch (error) {
        console.error("⚠️ MongoDB connection error:", error);
        cached.promise = null;
        throw error;
    }
}