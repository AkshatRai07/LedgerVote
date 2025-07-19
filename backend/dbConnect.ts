import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || "";

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose; // caching the connection to db to stop reconnecting during reloads

if (!cached) {
  cached = (global as any).mongoose = { connection: null, promise: null };
}

export default async function dbConnect() {
  if (cached.connection) {
    return cached.connection;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {});
  }
  cached.connection = await cached.promise;
  return cached.connection;
}
