import mongoose from 'mongoose';

let isConnected = false;
let inMemoryStore = [];

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[MedQueue DB] MONGODB_URI not provided. Using high-performance in-memory database store.');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('[MedQueue DB] MongoDB Atlas connected successfully.');
    return true;
  } catch (error) {
    console.warn('[MedQueue DB] MongoDB connection error:', error.message);
    console.log('[MedQueue DB] Falling back to in-memory patient queue store.');
    return false;
  }
};

export const getDBStatus = () => isConnected;
export const getMemoryStore = () => inMemoryStore;
export const setMemoryStore = (store) => {
  inMemoryStore = store;
};
