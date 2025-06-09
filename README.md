# Claude Bug Autofix Test Repository

This is a test repository for testing the Claude Bug Autofix GitHub Action workflow.

## What's in this repo?

- **Express.js API** with intentional bugs for testing
- **GitHub Action workflow** that uses Claude to automatically fix bugs
- **Sample test scenarios** for different types of bugs

## Intentional Bugs in the Code

The `index.js` file contains several intentional bugs:

1. **Missing error handling** - `/users/:id` endpoint crashes when user not found
2. **No input validation** - `/users` POST endpoint accepts invalid data
3. **Inefficient operations** - `/users` GET endpoint has performance issues
4. **Blocking operations** - `/heavy-operation` blocks the event loop
5. **Missing global error handler** - Unhandled errors crash the app

## How to Test the Claude Autofix Workflow

### Prerequisites

1. **GitHub Repository**: Push this code to a GitHub repository
2. **Secrets Setup**: Add `ANTHROPIC_API_KEY` to your repository secrets
3. **Permissions**: Ensure the repository has Actions enabled

### Method 1: Manual Trigger (Recommended for Testing)

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select "Claude Bug AutoFix" workflow
4. Click "Run workflow"
5. Enter a bug description like:
   ```
   Fix the bug in the /users/:id endpoint where the server crashes when requesting a user that doesn't exist. The error is "Cannot read property 'id' of undefined".
   ```

### Method 2: Repository Dispatch (Production Use)

Send a POST request to trigger the workflow:

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{
    "event_type": "bug_from_production",
    "client_payload": {
      "prompt": "Fix the TypeError in /users/:id endpoint where accessing properties of undefined user causes server crash"
    }
  }'
```

## Expected Behavior

When the workflow runs successfully, Claude should:

1. **Analyze** the bug description
2. **Identify** the problematic code
3. **Implement** a proper fix (e.g., add error handling)
4. **Create** a new branch with the fix
5. **Open** a pull request with the changes

## Sample Bug Reports to Test

Try these different bug scenarios:

### Scenario 1: Crash Bug
```
The server crashes when requesting /users/999 (non-existent user). Error: "Cannot read property 'id' of undefined"
```

### Scenario 2: Validation Bug
```
The POST /users endpoint accepts empty or invalid data, creating users with undefined name/email fields
```

### Scenario 3: Performance Bug
```
The /users endpoint is slow and inefficient when handling the limit parameter
```

### Scenario 4: Blocking Operation
```
The /heavy-operation endpoint blocks the entire server and makes it unresponsive
```

## What Claude Should Fix

For each bug, Claude should implement appropriate solutions:

- **Error handling** with proper HTTP status codes
- **Input validation** with meaningful error messages
- **Performance optimizations** using efficient algorithms
- **Async operations** to prevent blocking
- **Global error middleware** for graceful error handling

## Testing the Fixes

After Claude creates a PR:

1. **Review the changes** in the pull request
2. **Test locally** by checking out the branch
3. **Run the server**: `npm start`
4. **Test the endpoints** with curl or Postman
5. **Verify** the bugs are fixed

## Files Structure

```
claude-autofix-test/
├── .github/
│   └── workflows/
│       └── claude_bug_autofix.yml    # The GitHub Action workflow
├── index.js                          # Express app with bugs
├── package.json                      # Node.js dependencies
└── README.md                         # This file
```

## Notes

- The workflow includes both `repository_dispatch` and `workflow_dispatch` triggers
- Manual testing is easier with `workflow_dispatch`
- Production systems would typically use `repository_dispatch`
- Claude will create branches and PRs automatically
- Review all changes before merging to ensure quality 