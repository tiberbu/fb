#!/bin/bash

# Form Builder Server API Test Script
# Make sure the server is running on localhost:3001

BASE_URL="http://localhost:3001"
echo "🧪 Testing Form Builder Server API"
echo "=================================="

# Test 1: Health check
echo "1. Testing health check endpoint..."
curl -s "$BASE_URL/health" | jq '.'
echo -e "\\n"

# Test 2: Get all form configurations
echo "2. Getting all form configurations..."
curl -s "$BASE_URL/api/form-configurations" | jq '.data[] | {id: ._id, name: .name, description: .description}'
echo -e "\\n"

# Test 3: Create a new form configuration
echo "3. Creating a new form configuration..."
FORM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/form-configurations" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Form",
    "description": "A test form created via API",
    "configuration": {
      "tabs": [
        {
          "id": "test_tab",
          "title": "Test Section",
          "sections": [
            {
              "id": "test_section",
              "title": "Test Fields",
              "rows": [
                {
                  "columns": [
                    {
                      "fields": [
                        {
                          "id": "test_field",
                          "type": "text",
                          "label": "Test Field",
                          "required": true
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    "createdBy": "test_user"
  }')

echo "$FORM_RESPONSE" | jq '.'
FORM_ID=$(echo "$FORM_RESPONSE" | jq -r '.data._id')
echo "Created form with ID: $FORM_ID"
echo -e "\\n"

# Test 4: Submit form data
if [ "$FORM_ID" != "null" ] && [ "$FORM_ID" != "" ]; then
  echo "4. Submitting form data..."
  SUBMISSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/form-submissions" \\
    -H "Content-Type: application/json" \\
    -d "{
      \"formConfigurationId\": \"$FORM_ID\",
      \"submissionData\": {
        \"test_field\": \"This is a test submission\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
      },
      \"submittedBy\": \"test_user\",
      \"metadata\": {
        \"testRun\": true,
        \"source\": \"api_test_script\"
      }
    }")
  
  echo "$SUBMISSION_RESPONSE" | jq '.'
  SUBMISSION_ID=$(echo "$SUBMISSION_RESPONSE" | jq -r '.data._id')
  echo "Created submission with ID: $SUBMISSION_ID"
  echo -e "\\n"

  # Test 5: Get submissions for the form
  echo "5. Getting submissions for the form..."
  curl -s "$BASE_URL/api/form-submissions/form/$FORM_ID" | jq '.'
  echo -e "\\n"

  # Test 6: Update submission status
  if [ "$SUBMISSION_ID" != "null" ] && [ "$SUBMISSION_ID" != "" ]; then
    echo "6. Updating submission status to 'processed'..."
    curl -s -X PUT "$BASE_URL/api/form-submissions/$SUBMISSION_ID/status" \\
      -H "Content-Type: application/json" \\
      -d '{"status": "processed"}' | jq '.'
    echo -e "\\n"
  fi
else
  echo "❌ Failed to create form, skipping submission tests"
fi

# Test 7: Get all submissions
echo "7. Getting all form submissions..."
curl -s "$BASE_URL/api/form-submissions?limit=5" | jq '.data[] | {id: ._id, formName: .formName, status: .status, createdAt: .createdAt}'
echo -e "\\n"

echo "✅ API testing completed!"
echo "Check the server logs and MongoDB to verify data persistence."
