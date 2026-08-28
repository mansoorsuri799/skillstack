import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Allow build without env; runtime will throw on use
  console.warn("MONGODB_URI is not set");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

let userIndexesEnsured = false;
async function ensureUserIndexes() {
  if (userIndexesEnsured) return;
  try {
    const db = mongoose.connection.db;
    if (db) {
      const usersCollection = db.collection("users");

      // 1. Unset null values so sparse unique indexes work properly without collisions
      try {
        await usersCollection.updateMany(
          { dashboardApiKey: null },
          { $unset: { dashboardApiKey: "" } },
        );
        await usersCollection.updateMany(
          { googleId: null },
          { $unset: { googleId: "" } },
        );
        await usersCollection.updateMany(
          { username: null },
          { $unset: { username: "" } },
        );
      } catch {
        // Ignore update error
      }

      // 2. Drop old non-sparse or conflicting indexes
      const indexes = await usersCollection.indexes();
      for (const idx of indexes) {
        if (
          (idx.name === "dashboardApiKey_1" || idx.name === "googleId_1" || idx.name === "username_1") &&
          !idx.sparse
        ) {
          try {
            await usersCollection.dropIndex(idx.name);
          } catch {
            // Ignore if drop fails
          }
        }
      }

      // 3. Ensure sparse indexes exist
      try {
        await usersCollection.createIndex(
          { dashboardApiKey: 1 },
          { unique: true, sparse: true, background: true },
        );
      } catch {
        // Ignore
      }
      try {
        await usersCollection.createIndex(
          { googleId: 1 },
          { sparse: true, background: true },
        );
      } catch {
        // Ignore
      }
      try {
        await usersCollection.createIndex(
          { username: 1 },
          { unique: true, sparse: true, background: true },
        );
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore index error
  }
  userIndexesEnsured = true;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your environment");
  }

  if (cached.conn) {
    await ensureUserIndexes();
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  await ensureUserIndexes();
  return cached.conn;
}
