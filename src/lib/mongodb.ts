import { MongoClient, Db, Collection, Document } from 'mongodb';

// Check if we have a valid MongoDB URI
const USE_MOCK_DB = !process.env.MONGODB_URI ||
                   process.env.MONGODB_URI === 'mongodb://localhost:27017/weatherapp' ||
                   process.env.MONGODB_URI.includes('your_mongodb_connection_string_here');

if (USE_MOCK_DB) {
  console.warn('Using in-memory storage because no valid MongoDB URI was provided');
}

/**
 * Mock MongoDB client for testing without a real database
 */
class MockMongoClient implements Pick<MongoClient, 'connect' | 'db'> {
  /**
   * Mock connect method
   * @returns The mock client instance
   */
  async connect(): Promise<this> {
    console.log('Connected to mock MongoDB');
    return this;
  }

  /**
   * Mock db method
   * @returns A mock database object
   */
  db(): Pick<Db, 'collection'> {
    return {
      collection: (): Pick<Collection<Document>, 'findOne' | 'find' | 'insertOne' | 'updateOne' | 'deleteOne'> => ({
        // Mock collection methods
        findOne: async () => null,
        find: () => ({
          toArray: async () => []
        }),
        insertOne: async () => ({ acknowledged: true, insertedId: 'mock-id' }),
        updateOne: async () => ({ acknowledged: true, modifiedCount: 1 }),
        deleteOne: async () => ({ acknowledged: true, deletedCount: 1 })
      })
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
  const uri: string = process.env.MONGODB_URI!;
  const options: Record<string, unknown> = {};

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;