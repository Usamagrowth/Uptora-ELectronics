import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Comprehensive URI validation
function validateMongoDBURI(uri) {
  if (!uri) {
    return { valid: false, error: "MONGODB_URI is not set in environment variables" };
  }
  
  if (typeof uri !== 'string') {
    return { valid: false, error: "MONGODB_URI must be a string" };
  }
  
  // Check for basic MongoDB URI patterns
  const patterns = [
    /^mongodb\+srv:\/\//,  // SRV URI format
    /^mongodb:\/\//,       // Standard URI format
  ];
  
  const isValidPattern = patterns.some(pattern => pattern.test(uri));
  
  if (!isValidPattern) {
    return { valid: false, error: "Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://" };
  }
  
  // Check for required components
  if (!uri.includes('@') && uri.includes('mongodb+srv://')) {
    return { valid: false, error: "MongoDB URI missing credentials (username:password)" };
  }
  
  return { valid: true };
}

// Log connection diagnostics
function logConnectionDiagnostics() {
  console.log("[MongoDB] Connection Diagnostics:");
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - MONGODB_URI set: ${!!uri}`);
  console.log(`  - MONGODB_DB_NAME: ${process.env.MONGODB_DB_NAME || 'uptora-electronics (default)'}`);
  
  if (uri) {
    const maskedUri = uri.replace(/:([^:@]{1,10})@/, ':****@');
    console.log(`  - URI (masked): ${maskedUri}`);
    
    const validation = validateMongoDBURI(uri);
    console.log(`  - URI validation: ${validation.valid ? 'PASS' : 'FAIL'}`);
    if (!validation.valid) {
      console.log(`  - URI error: ${validation.error}`);
    }
  }
}

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("[MongoDB] MONGODB_URI is not set.");
}

const options = {
  maxPoolSize: 20, // Increased for better performance
  minPoolSize: 5,  // Increased for better performance
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

let clientPromise;
let connectionError = null;
let connectionState = 'disconnected';

// Validate URI before attempting connection
const uriValidation = validateMongoDBURI(uri);

if (!uri) {
  clientPromise = Promise.resolve(null);
  connectionError = new Error("MongoDB URI not configured");
  connectionState = 'invalid_uri';
  console.error("[MongoDB] Connection failed: MONGODB_URI is not set");
} else if (!uriValidation.valid) {
  clientPromise = Promise.resolve(null);
  connectionError = new Error(uriValidation.error);
  connectionState = 'invalid_uri';
  console.error("[MongoDB] Connection failed:", uriValidation.error);
} else {
  logConnectionDiagnostics();
  
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      connectionState = 'connecting';
      
      global._mongoClientPromise = client.connect()
        .then(connectedClient => {
          connectionState = 'connected';
          console.log("[MongoDB] Connected successfully to cluster");
          return connectedClient;
        })
        .catch(err => {
          connectionState = 'failed';
          connectionError = err;
          
          // Provide specific error guidance
          let errorMessage = err.message;
          if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('querySrv')) {
            errorMessage = "DNS resolution failed. Check: 1) Internet connection, 2) MongoDB Atlas cluster status, 3) IP whitelist in Network Access";
          } else if (errorMessage.includes('authentication')) {
            errorMessage = "Authentication failed. Check username/password in MONGODB_URI";
          } else if (errorMessage.includes('ENOTFOUND')) {
            errorMessage = "Host not found. Check MongoDB cluster name and URI format";
          }
          
          console.error("[MongoDB] Connection failed:", errorMessage);
          console.error("[MongoDB] Full error:", err);
          return null;
        });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    connectionState = 'connecting';
    
    clientPromise = client.connect()
      .then(connectedClient => {
        connectionState = 'connected';
        console.log("[MongoDB] Connected successfully to cluster");
        return connectedClient;
      })
      .catch(err => {
        connectionState = 'failed';
        connectionError = err;
        
        let errorMessage = err.message;
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('querySrv')) {
          errorMessage = "DNS resolution failed. Check: 1) Internet connection, 2) MongoDB Atlas cluster status, 3) IP whitelist in Network Access";
        } else if (errorMessage.includes('authentication')) {
          errorMessage = "Authentication failed. Check username/password in MONGODB_URI";
        } else if (errorMessage.includes('ENOTFOUND')) {
          errorMessage = "Host not found. Check MongoDB cluster name and URI format";
        }
        
        console.error("[MongoDB] Connection failed:", errorMessage);
        console.error("[MongoDB] Full error:", err);
        return null;
      });
  }
}

export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  
  if (!client) {
    const errorMsg = connectionError 
      ? `MongoDB connection failed: ${connectionError.message}` 
      : "MongoDB is not configured. Set MONGODB_URI in your environment.";
    throw new Error(errorMsg);
  }
  
  try {
    const dbName = process.env.MONGODB_DB_NAME || "uptora-electronics";
    console.log("[MongoDB] Accessing database:", dbName);
    
    const db = client.db(dbName);
    // Quick connection test
    await db.admin().ping();
    console.log("[MongoDB] Database access successful:", dbName);
    
    // Check if products collection exists and has documents
    const collections = await db.listCollections().toArray();
    console.log("[MongoDB] Available collections:", collections.map(c => c.name));
    
    const productCount = await db.collection("products").countDocuments();
    console.log("[MongoDB] Products count:", productCount);
    
    return db;
  } catch (err) {
    console.error("[MongoDB] Database access failed:", err.message);
    console.error("[MongoDB] Attempted database name:", process.env.MONGODB_DB_NAME || "uptora-electronics");
    throw new Error(`MongoDB database access failed: ${err.message}`);
  }
}

export function getConnectionError() {
  return connectionError;
}

export function getConnectionState() {
  return connectionState;
}

export function getConnectionDiagnostics() {
  return {
    uriSet: !!uri,
    uriValid: uriValidation.valid,
    uriError: uriValidation.error,
    state: connectionState,
    error: connectionError?.message,
    dbName: process.env.MONGODB_DB_NAME || 'uptora-electronics',
    env: process.env.NODE_ENV
  };
}

// Test connection function for debugging
export async function testConnection() {
  try {
    const client = await clientPromise;
    if (!client) {
      return { success: false, error: connectionError?.message || "No client available" };
    }
    
    await client.db(process.env.MONGODB_DB_NAME || "uptora-electronics").admin().ping();
    return { success: true, message: "Connection successful" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
