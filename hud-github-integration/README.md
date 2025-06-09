# Hud GitHub Integration

A GitHub App that allows Hud to automatically create issues in customer repositories when bugs are detected.

## Security Features

- **Minimal Permissions**: Only `issues:write` and `metadata:read`
- **No Code Access**: Cannot read repository contents
- **Scoped Access**: Only works on repositories where installed
- **Revokable**: Customers can uninstall anytime

## Setup Instructions

### 1. Create GitHub App

1. Go to https://github.com/settings/apps/new
2. Fill out the form with these settings:
   - **Name**: `Hud Bug Reporter`
   - **Description**: `Automatically creates GitHub issues when Hud detects bugs`
   - **Homepage URL**: Your company website
   - **Webhook URL**: `https://your-domain.com/webhook`
   - **Permissions**: Issues (Write), Metadata (Read)
   - **Events**: None needed

3. Save the following credentials:
   - App ID
   - Private Key (download .pem file)
   - Webhook Secret

### 2. Deploy the Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub App credentials
   ```

3. Place your private key file in the project directory

4. Start the server:
   ```bash
   npm start
   ```

### 3. Customer Onboarding

Send customers this installation link:
```
https://github.com/apps/YOUR_APP_NAME/installations/new
```

After installation, they'll get an Installation ID to provide to you.

## API Usage

### Create Issue

```bash
POST /api/create-issue
Authorization: Bearer YOUR_API_SECRET
Content-Type: application/json

{
  "installation_id": "12345678",
  "owner": "customer-username",
  "repo": "customer-repo",
  "title": "Bug detected by Hud",
  "body": "Detailed bug description...",
  "labels": ["bug", "hud-detected", "high-priority"]
}
```

### Response

```json
{
  "success": true,
  "issue": {
    "number": 123,
    "url": "https://github.com/customer/repo/issues/123",
    "title": "Bug detected by Hud"
  }
}
```

## Integration with Hud

Add this to your Hud monitoring system:

```javascript
async function reportToGitHub(bugDetails, customerConfig) {
  const response = await fetch('https://your-api.com/api/create-issue', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUD_GITHUB_API_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      installation_id: customerConfig.github_installation_id,
      owner: customerConfig.github_owner,
      repo: customerConfig.github_repo,
      title: `Hud Alert: ${bugDetails.type} in ${bugDetails.component}`,
      body: formatBugReport(bugDetails),
      labels: ['bug', 'hud-detected', bugDetails.severity]
    })
  });
  
  return response.json();
}
```

## Testing

1. Run: `source .env`
2. Run: `export INSTALLATION_ID=xxx`
3. Run: `node test-issue-creation.js`

## Deployment

For production deployment:

1. Use a proper database instead of in-memory storage
2. Add rate limiting and proper authentication
3. Use HTTPS with valid SSL certificates
4. Set up monitoring and logging
5. Consider using a service like Railway, Vercel, or AWS Lambda