# AI Thumbnail Generator API Endpoints

This directory contains the API endpoints for the AI Thumbnail Generator feature.

## Authentication

All endpoints require authentication using Supabase Auth. The user must be logged in to access these endpoints.

## Endpoints

### 1. Generate Thumbnail

**POST** `/api/ai/thumbnail/generate`

Generates an AI thumbnail based on the provided parameters.

**Request Body:**
```json
{
  "platform": "YOUTUBE",           // Required: YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, BLOG, GENERIC
  "contentType": "video",            // Required: video, blog, social, etc.
  "title": "Your Title Here",       // Required: Content title
  "description": "Content description", // Optional: Content description
  "style": "professional",            // Optional: professional, casual, bold, minimal, creative, educational
  "targetAudience": "Content creators", // Optional: Target audience description
  "keywords": ["keyword1", "keyword2"], // Optional: Relevant keywords
  "templateId": "template-id",     // Optional: Template ID to use
  "dimensions": {                     // Optional: Custom dimensions
    "width": 1280,
    "height": 720
  }
}
```

**Response:**
```json
{
  "success": true,
  "generationId": "uuid-string",
  "prompt": "Generated AI prompt for image generation",
  "status": "PROCESSING",
  "estimatedTime": 5
}
```

### 2. Check Generation Status

**GET** `/api/ai/thumbnail/status/:id`

Checks the status of a thumbnail generation.

**URL Parameters:**
- `id`: The generation ID to check status for

**Response:**
```json
{
  "success": true,
  "generation": {
    "id": "uuid-string",
    "status": "COMPLETED",           // PENDING, PROCESSING, COMPLETED, FAILED
    "thumbnailUrl": "https://...",      // Available when status is COMPLETED
    "imageUrl": "https://...",           // Original image URL
    "progress": 100,                    // Progress percentage (0-100)
    "title": "Your Title Here",
    "description": "Content description",
    "platform": {
      "id": "youtube",
      "name": "YOUTUBE",
      "displayName": "YouTube"
    },
    "dimensions": {
      "width": 1280,
      "height": 720
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. List Templates

**GET** `/api/ai/thumbnail/templates`

Lists available thumbnail templates with optional filtering.

**Query Parameters:**
- `platform`: Optional filter by platform (YOUTUBE, INSTAGRAM, TIKTOK, etc.)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "template-id",
      "name": "Template Name",
      "platform": {
        "id": "youtube",
        "name": "YOUTUBE",
        "displayName": "YouTube",
        "icon": "youtube",
        "color": "#FF0000"
      },
      "dimensions": {
        "width": 1280,
        "height": 720
      },
      "overlays": [...],              // Array of overlay configurations
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 4. Save Thumbnail

**POST** `/api/ai/thumbnail/save`

Saves a generated thumbnail to the user's collection.

**Request Body:**
```json
{
  "generationId": "uuid-string",      // Required: ID of the generation to save
  "title": "Custom Title",           // Optional: Custom title
  "description": "Custom description", // Optional: Custom description
  "tags": ["tag1", "tag2"],      // Optional: Tags for organization
  "isPublic": false                  // Optional: Whether to make it public (default: false)
}
```

**Response:**
```json
{
  "success": true,
  "savedThumbnail": {
    "id": "uuid-string",
    "title": "Title",
    "description": "Description",
    "thumbnailUrl": "https://...",
    "imageUrl": "https://...",
    "platform": {...},
    "tags": ["tag1", "tag2"],
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Get History

**GET** `/api/ai/thumbnail/history`

Retrieves the user's thumbnail generation history with filtering options.

**Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)
- `platform`: Filter by platform (optional)
- `status`: Filter by status (optional)
- `dateFrom`: Filter by date range start (optional, ISO string)
- `dateTo`: Filter by date range end (optional, ISO string)
- `search`: Search in title/description (optional)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid-string",
      "title": "Title",
      "description": "Description",
      "platform": {...},
      "status": "COMPLETED",
      "thumbnailUrl": "https://...",
      "imageUrl": "https://...",
      "dimensions": {...},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "metadata": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "stats": {
    "total": 100,
    "completed": 80,
    "pending": 10,
    "processing": 5,
    "failed": 5
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting

Endpoints implement rate limiting to prevent abuse:
- Generate endpoint: 5 requests per minute per user
- Other endpoints: 100 requests per minute per user

## Security

- All endpoints require authentication
- Users can only access their own data
- Input validation and sanitization
- SQL injection prevention through Prisma ORM

## Platform-Specific Dimensions

Default dimensions for each platform:
- **YouTube**: 1280x720 (16:9)
- **Instagram**: 1080x1080 (1:1)
- **TikTok**: 1080x1920 (9:16)
- **LinkedIn**: 1200x627 (1.91:1)
- **Twitter**: 1200x675 (16:9)
- **Blog**: 1200x630 (1.9:1)