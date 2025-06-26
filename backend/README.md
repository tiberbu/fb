# Form Builder Server

A Node.js server with MongoDB integration for managing form configurations and form submissions.

## Features

- 📝 **Form Configuration Management**: Create, read, update, and delete form configurations
- 💾 **Form Data Submission**: Submit and store form data as JSON
- 🔍 **Data Retrieval**: Query and filter form submissions
- 🗄️ **MongoDB Integration**: Persistent data storage with MongoDB
- 🚀 **RESTful API**: Clean REST API endpoints
- ✅ **Data Validation**: Input validation and error handling
- 📊 **Pagination**: Paginated responses for large datasets

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally on default port 27017)
- npm or yarn

## Installation

1. **Clone or navigate to the server directory:**
   ```bash
   cd form-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/form-builder` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Form Configurations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/form-configurations` | Get all form configurations |
| GET | `/api/form-configurations/:id` | Get specific form configuration |
| POST | `/api/form-configurations` | Create new form configuration |
| PUT | `/api/form-configurations/:id` | Update form configuration |
| DELETE | `/api/form-configurations/:id` | Delete form configuration (soft delete) |

### Form Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/form-submissions` | Get all form submissions |
| GET | `/api/form-submissions/:id` | Get specific form submission |
| GET | `/api/form-submissions/form/:formConfigurationId` | Get submissions for specific form |
| POST | `/api/form-submissions` | Submit form data |
| PUT | `/api/form-submissions/:id/status` | Update submission status |
| DELETE | `/api/form-submissions/:id` | Delete form submission |

## API Usage Examples

### 1. Create Form Configuration

```bash
curl -X POST http://localhost:3001/api/form-configurations \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Contact Form",
    "description": "A simple contact form",
    "configuration": {
      "tabs": [
        {
          "id": "tab1",
          "title": "Contact Information",
          "sections": [
            {
              "id": "section1",
              "title": "Personal Details",
              "rows": [
                {
                  "columns": [
                    {
                      "fields": [
                        {
                          "id": "name",
                          "type": "text",
                          "label": "Full Name",
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
    }
  }'
```

### 2. Submit Form Data

```bash
curl -X POST http://localhost:3001/api/form-submissions \\
  -H "Content-Type: application/json" \\
  -d '{
    "formConfigurationId": "YOUR_FORM_CONFIG_ID",
    "submissionData": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, this is a test submission!"
    },
    "submittedBy": "user123"
  }'
```

### 3. Get Form Configurations

```bash
curl http://localhost:3001/api/form-configurations
```

### 4. Get Form Submissions for a Specific Form

```bash
curl http://localhost:3001/api/form-submissions/form/YOUR_FORM_CONFIG_ID
```

## Data Models

### FormConfiguration Schema

```javascript
{
  name: String,           // Form name
  description: String,    // Form description
  configuration: Object,  // Form structure (JSON)
  isActive: Boolean,      // Active status
  version: Number,        // Version number
  createdBy: String,      // Creator identifier
  updatedBy: String,      // Last updater
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

### FormSubmission Schema

```javascript
{
  formConfigurationId: ObjectId,  // Reference to form config
  formName: String,               // Form name for quick reference
  submissionData: Object,         // Form data (JSON)
  submittedBy: String,           // Submitter identifier
  submissionId: String,          // Unique submission ID
  status: String,                // Status: submitted/processed/archived
  metadata: {                    // Additional metadata
    userAgent: String,
    ipAddress: String,
    submissionTime: Date
  },
  createdAt: Date,              // Submission timestamp
  updatedAt: Date               // Last update timestamp
}
```

## Query Parameters

### Form Configurations
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `isActive` - Filter by active status (true/false)

### Form Submissions
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `formConfigurationId` - Filter by form configuration
- `status` - Filter by status (submitted/processed/archived)
- `startDate` - Filter submissions from date (YYYY-MM-DD)
- `endDate` - Filter submissions to date (YYYY-MM-DD)

## Response Format

All API responses follow this format:

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {}, // Response data
  "pagination": { // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Error Handling

Error responses include:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [], // Validation errors (if any)
  "error": "Detailed error message"
}
```

## Integration with Frontend

To integrate with your Vue.js form builder:

1. **Save Form Configuration**: When user creates a form, POST to `/api/form-configurations`
2. **Load Forms**: GET from `/api/form-configurations` to show available forms
3. **Submit Form Data**: When user submits a form, POST to `/api/form-submissions`
4. **View Submissions**: GET from `/api/form-submissions/form/:id` to view form data

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-restart
npm run dev

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
