const express = require('express');
const { App } = require('@octokit/app');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize GitHub App
const githubApp = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8'),
  webhooks: {
    secret: process.env.GITHUB_WEBHOOK_SECRET,
  },
});

// Simple in-memory storage (replace with database in production)
const customerInstallations = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Installation callback - customers will be redirected here after installing the app
app.get('/auth/callback', async (req, res) => {
  const { installation_id, setup_action } = req.query;
  
  if (setup_action === 'install') {
    // Store the installation ID (in production, associate with customer)
    console.log(`New installation: ${installation_id}`);
    
    res.send(`
      <h1>Hud Bug Reporter Installed!</h1>
      <p>Installation ID: ${installation_id}</p>
      <p>You can now close this window.</p>
      <p>Provide this Installation ID to your Hud administrator.</p>
    `);
  } else {
    res.send('<h1>Installation cancelled</h1>');
  }
});

// Webhook endpoint (GitHub will call this for events)
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  try {
    await githubApp.webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'],
      name: req.headers['x-github-event'],
      signature,
      payload,
    });
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook verification failed');
  }
});

// API endpoint for Hud to create issues
app.post('/api/create-issue', async (req, res) => {
  // Authenticate the request (add proper API key validation)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { 
    installation_id, 
    owner, 
    repo, 
    title, 
    body, 
    labels = ['bug', 'hud-detected'] 
  } = req.body;

  if (!installation_id || !owner || !repo || !title || !body) {
    return res.status(400).json({ 
      error: 'Missing required fields: installation_id, owner, repo, title, body' 
    });
  }

  try {
    // Validate installation_id is a number
    const installationIdNum = parseInt(installation_id);
    if (isNaN(installationIdNum)) {
      return res.status(400).json({ 
        error: 'Invalid installation_id. Must be a number.' 
      });
    }
    
    // Get installation Octokit instance
    const installationOctokit = await githubApp.getInstallationOctokit(installationIdNum);
    
    // Create the issue using the request method
    const issueResponse = await installationOctokit.request({
      method: 'POST',
      url: `/repos/${owner}/${repo}/issues`,
      data: {
        title,
        body,
        labels,
      }
    });

    console.log(`Created issue #${issueResponse.data.number} in ${owner}/${repo}`);
    
    res.json({
      success: true,
      issue: {
        number: issueResponse.data.number,
        url: issueResponse.data.html_url,
        title: issueResponse.data.title,
      }
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ 
      error: 'Failed to create issue',
      details: error.message 
    });
  }
});

// Customer management endpoints
app.post('/api/customers', async (req, res) => {
  const { customer_id, installation_id, repos } = req.body;
  
  customerInstallations.set(customer_id, {
    installation_id,
    repos,
    created_at: new Date().toISOString(),
  });
  
  res.json({ success: true, customer_id });
});

app.get('/api/customers/:customer_id', (req, res) => {
  const customer = customerInstallations.get(req.params.customer_id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hud GitHub Integration server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Install URL: https://github.com/apps/your-app-name/installations/new`);
});