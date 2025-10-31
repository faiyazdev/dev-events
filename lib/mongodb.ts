/**
 * Mongoose connection helper for Next.js (Node.js runtime).
 *
 * - Caches the connection on the global object to avoid creating multiple
 *   connections across hot-reloads in development.
 * - Uses strict TypeScript types (no `any`).
 * - Safe for production usage and includes sensible defaults.
 */
import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";

/**
 * MongoDB connection URI
 * Ensure MONGODB_URI is set in your environment (.env.local or server env).
 */
const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Set it in .env.local or your server environment."
  );
}

/**
 * Cache shape stored on the global object so it's not re-initialized on every HMR cycle.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment the Node global type to include our cache key.
// eslint-disable-next-line no-var
declare global {
  // Using `var` so TypeScript understands this is added to the Node global scope.
  // This is safe because we only create/modify it in this module.
  var mongooseCache: MongooseCache | undefined;
}

// Re-use the existing cache if present, otherwise initialize it.
let cached = globalThis.mongooseCache;
if (!cached) {
  cached = globalThis.mongooseCache = { conn: null, promise: null };
}

const isProd = process.env.NODE_ENV === "production";

// Connection options tuned for server environments. Adjust as needed.
const connectOptions: ConnectOptions = {
  bufferCommands: false, // Let Mongoose throw immediately if models are used before connecting
  maxPoolSize: isProd ? 10 : 5, // Keep pools modest by default
  serverSelectionTimeoutMS: 5000, // Fast fail if the server is unreachable
  socketTimeoutMS: 45000, // Drop idle sockets after a reasonable time
  autoIndex: !isProd, // Prefer creating indexes via migrations in production
};

// Optional: verbose query logging in development
if (!isProd) {
  mongoose.set("debug", false); // set to true to enable dev query logs
}

/**
 * Establish (or re-use) a Mongoose connection.
 *
 * This function is safe to call multiple times across API routes, route handlers,
 * and server components. It returns the existing connection if already established.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if available.
  if (cached?.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create one and store it in the cache.
  if (!cached?.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, connectOptions).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    // Reset the promise so the next call can retry.
    cached!.promise = null;
    throw err;
  }

  return cached!.conn as Mongoose;
}

/**
 * Disconnect helper primarily for tests or worker shutdowns.
 * Typically not needed in Next.js API routes or Route Handlers.
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!cached?.conn) return;
  await mongoose.disconnect();
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
}
