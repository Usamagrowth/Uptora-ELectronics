import { getConnectionDiagnostics, getConnectionState, getConnectionError } from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end("Method Not Allowed");
    }

    const diagnostics = getConnectionDiagnostics();
    const state = getConnectionState();
    const error = getConnectionError();

    const healthStatus = {
      status: state === 'connected' ? 'healthy' : 'unhealthy',
      connectionState: state,
      diagnostics: diagnostics,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
      troubleshooting: getTroubleshootingSteps(diagnostics, state, error)
    };

    // Return appropriate HTTP status based on connection state
    const statusCode = state === 'connected' ? 200 : 503;
    return res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({
      status: 'error',
      error: "Health check failed",
      message: error.message
    });
  }
}

function getTroubleshootingSteps(diagnostics, state, error) {
  const steps = [];

  if (!diagnostics.uriSet) {
    steps.push({
      priority: 'critical',
      issue: 'MONGODB_URI not configured',
      solution: 'Add MONGODB_URI to your .env file. Get it from MongoDB Atlas → Connect → Connect your application'
    });
  }

  if (!diagnostics.uriValid) {
    steps.push({
      priority: 'critical',
      issue: 'Invalid MongoDB URI format',
      solution: diagnostics.uriError || 'Check URI format. Should start with mongodb:// or mongodb+srv://'
    });
  }

  if (state === 'failed' && error) {
    const errorMsg = error.message;
    
    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('querySrv') || errorMsg.includes('DNS')) {
      steps.push({
        priority: 'high',
        issue: 'DNS resolution failed / Connection refused',
        solution: '1) Check internet connection 2) Verify MongoDB Atlas cluster is not paused 3) Add your IP to Network Access whitelist in Atlas 4) Check cluster name in URI'
      });
    } else if (errorMsg.includes('authentication')) {
      steps.push({
        priority: 'high',
        issue: 'Authentication failed',
        solution: '1) Verify username/password in MONGODB_URI 2) Check Database Access user permissions 3) Ensure user has Atlas Admin role'
      });
    } else if (errorMsg.includes('ENOTFOUND')) {
      steps.push({
        priority: 'high',
        issue: 'MongoDB host not found',
        solution: '1) Verify cluster name in URI 2) Check cluster exists in MongoDB Atlas 3) Ensure correct region selection'
      });
    } else if (errorMsg.includes('timeout')) {
      steps.push({
        priority: 'medium',
        issue: 'Connection timeout',
        solution: '1) Check network connectivity 2) Verify firewall settings 3) Try increasing timeout values'
      });
    }
  }

  if (state === 'disconnected') {
    steps.push({
      priority: 'medium',
      issue: 'Connection not established',
      solution: 'Restart the development server to establish MongoDB connection'
    });
  }

  // General troubleshooting steps
  steps.push({
    priority: 'low',
    issue: 'General MongoDB Atlas setup',
    solution: '1) Go to MongoDB Atlas → Clusters 2) Click Connect on your cluster 3) Choose "Connect your application" 4) Copy connection string 5) Replace <password> with actual password 6) Add to .env file'
  });

  return steps;
}
