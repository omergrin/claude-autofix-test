#!/bin/bash

# Test script for triggering Claude Bug Autofix workflow via repository dispatch
# Usage: ./test-webhook.sh [GITHUB_TOKEN] [REPO_OWNER] [REPO_NAME]

set -e

# Configuration
GITHUB_TOKEN=${1:-$GITHUB_TOKEN}
REPO_OWNER=${2:-"YOUR_USERNAME"}
REPO_NAME=${3:-"claude-autofix-test"}

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GitHub token is required"
    echo "Usage: $0 [GITHUB_TOKEN] [REPO_OWNER] [REPO_NAME]"
    echo "Or set GITHUB_TOKEN environment variable"
    exit 1
fi

echo "🚀 Triggering Claude Bug Autofix workflow..."
echo "Repository: $REPO_OWNER/$REPO_NAME"

# Test scenarios
declare -a scenarios=(
    "Fix the bug in the /users/:id endpoint where the server crashes when requesting a user that doesn't exist. The error is 'Cannot read property id of undefined'."
    "The POST /users endpoint accepts empty or invalid data, creating users with undefined name/email fields. Add proper input validation."
    "The /users endpoint is slow and inefficient when handling the limit parameter. Optimize the array operations."
    "The /heavy-operation endpoint blocks the entire server and makes it unresponsive. Make it asynchronous."
    "Add global error handling middleware to prevent unhandled errors from crashing the application."
)

echo ""
echo "Available test scenarios:"
for i in "${!scenarios[@]}"; do
    echo "$((i+1)). ${scenarios[$i]}"
done

echo ""
read -p "Select scenario (1-${#scenarios[@]}) or press Enter for scenario 1: " choice

# Default to scenario 1 if no choice made
choice=${choice:-1}

# Validate choice
if ! [[ "$choice" =~ ^[1-5]$ ]]; then
    echo "❌ Invalid choice. Using scenario 1."
    choice=1
fi

selected_scenario="${scenarios[$((choice-1))]}"

echo ""
echo "🎯 Selected scenario: $selected_scenario"
echo ""

# Trigger the workflow
response=$(curl -s -w "%{http_code}" -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
  -d "{
    \"event_type\": \"bug_from_production\",
    \"client_payload\": {
      \"prompt\": \"$selected_scenario\"
    }
  }")

# Extract HTTP status code (last 3 characters)
http_code="${response: -3}"
response_body="${response%???}"

if [ "$http_code" = "204" ]; then
    echo "✅ Workflow triggered successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    echo "2. Look for the 'Claude Bug AutoFix' workflow run"
    echo "3. Monitor the progress and check the results"
    echo "4. Review any pull requests created by Claude"
    echo ""
    echo "🔗 Direct link: https://github.com/$REPO_OWNER/$REPO_NAME/actions/workflows/claude_bug_autofix.yml"
else
    echo "❌ Failed to trigger workflow"
    echo "HTTP Status: $http_code"
    echo "Response: $response_body"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "- Check if the GitHub token has the correct permissions"
    echo "- Verify the repository owner and name are correct"
    echo "- Ensure the workflow file exists in .github/workflows/"
    echo "- Check if Actions are enabled for the repository"
fi 