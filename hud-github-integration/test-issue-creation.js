#!/usr/bin/env node

// Test script to create an issue via the API
// Usage: node test-issue-creation.js
require('dotenv').config();

const API_BASE = 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET;

async function testIssueCreation() {
  const payload = {
    installation_id: process.env.INSTALLATION_ID, // Replace with actual installation ID
    owner: 'omergrin', // Replace with repo owner
    repo: 'claude-autofix-test', // Replace with repo name
    title: 'Test Bug Report from Hud',
    body: `# Bug Report

**Detected by**: Hud Monitoring System
**Timestamp**: ${new Date().toISOString()}
**Severity**: High

## Description
Fix the bug in the /users/:id endpoint where the server crashes when requesting a user that doesnt

@claude - You are fixing a bug reported from production. Please:
  1. Analyze the bug description carefully
  2. Identify the root cause
  3. Implement a proper fix
  4. Add tests if appropriate
  5. Create a clear commit message explaining the fix
  6. The fix should be production-ready and follow best practices

---
*This issue was automatically created by [Hud](https://hud.io)*`,
    labels: ['bug', 'hud-detected', 'high-priority']
  };

  try {
    const response = await fetch(`${API_BASE}/api/create-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Issue created successfully!');
      console.log(`Issue #${result.issue.number}: ${result.issue.title}`);
      console.log(`URL: ${result.issue.url}`);
    } else {
      console.error('❌ Failed to create issue:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testIssueCreation();