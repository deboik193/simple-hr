// lib/mongodb.js
import mongoose from 'mongoose';
import { database } from './config';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      family: 4, // Use IPv4, skip IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected ✅");
      return mongoose;
    }).catch((error) => {
      console.error("MongoDB connection failed ❌", error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;