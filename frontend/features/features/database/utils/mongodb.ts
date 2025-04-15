import { MongoClient } from 'mongodb';
import { envConfig } from '@shared/lib/env';

// Check if we have a valid MongoDB URI
const USE_MOCK_DB: boolean =
  !envConfig.mongodbUri ||
  envConfig.mongodbUri === 'mongodb://localhost:27017/weatherapp' ||
  envConfig.mongodbUri.includes('your_mongodb_connection_string_here');

if (USE_MOCK_DB) {
  console.warn('Using in-memory storage because no valid MongoDB URI was provided');
}

/**
 * Create a mock client for testing without MongoDB
 * This class implements a subset of the MongoClient interface
 */
class MockMongoClient {
  /**
   * Mock connect method
   * @returns The mock client instance
   */
  async connect(): Promise<MockMongoClient> {
    console.log('Connected to mock MongoDB');
    return this;
  }

  /**
   * Mock db method
   * @returns A mock database object
   */
  db(): Record<string, any> {
    return {
      collection: () => ({
        // Mock collection methods
        findOne: async () => null,
        find: () => ({
          toArray: async () => [],
        }),
        insertOne: async () => ({ acknowledged: true, insertedId: 'mock-id' }),
        updateOne: async () => ({ acknowledged: true, modifiedCount: 1 }),
        deleteOne: async () => ({ acknowledged: true, deletedCount: 1 }),
      }),
    };
  }
}

let client: MongoClient | MockMongoClient;
let clientPromise: Promise<MongoClient | MockMongoClient>;

if (USE_MOCK_DB) {
  // Use mock client
  client = new MockMongoClient();
  clientPromise = client.connect();
} else {
  // Use real MongoDB client
  const uri: string = envConfig.mongodbUri;
  const options: Record<string, unknown> = {};

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo: typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    } = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

/**
 * Export a module-scoped MongoClient promise. By doing this in a
 * separate module, the client can be shared across functions.
 */
export default clientPromise;
