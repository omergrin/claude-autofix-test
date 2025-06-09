#!/usr/bin/env node

// Simple script to check GitHub App configuration
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
require('dotenv').config();

async function checkApp() {
  try {
    console.log('🔍 Checking GitHub App configuration...');
    
    // Check environment variables
    console.log(`App ID: ${process.env.GITHUB_APP_ID}`);
    console.log(`Private key path: ${process.env.GITHUB_PRIVATE_KEY_PATH}`);
    
    // Check if private key file exists
    if (!fs.existsSync(process.env.GITHUB_PRIVATE_KEY_PATH)) {
      console.log('❌ Private key file not found!');
      return;
    }
    
    const privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8');
    console.log(`✅ Private key loaded (${privateKey.length} characters)`);
    
    // Create auth
    const auth = createAppAuth({
      appId: process.env.GITHUB_APP_ID,
      privateKey: privateKey,
    });
    
    // Get app-level token
    const appAuthentication = await auth({ type: 'app' });
    console.log('✅ App authentication successful');
    
    // Create Octokit instance
    const octokit = new Octokit({
      auth: appAuthentication.token,
    });
    
    // Get app info
    const { data: app } = await octokit.rest.apps.getAuthenticated();
    console.log(`\n📱 App Info:`);
    console.log(`   Name: ${app.name}`);
    console.log(`   Owner: ${app.owner.login}`);
    console.log(`   ID: ${app.id}`);
    
    // List installations
    const { data: installations } = await octokit.rest.apps.listInstallations();
    console.log(`\n📋 Installations: ${installations.length}`);
    
    if (installations.length === 0) {
      console.log('\n❌ No installations found.');
      console.log(`🔗 Install your app at: https://github.com/apps/${app.slug}/installations/new`);
    } else {
      installations.forEach(installation => {
        console.log(`\n✅ Installation ID: ${installation.id}`);
        console.log(`   Account: ${installation.account.login}`);
        if (installation.account.login === 'omergrin') {
          console.log(`\n🎯 Use this for testing: INSTALLATION_ID=${installation.id}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status) {
      console.error(`HTTP Status: ${error.status}`);
    }
  }
}

checkApp();