# Hashtag Generator API Endpoints

This directory contains the API endpoints for the AI-powered Hashtag Generator tool. These endpoints provide comprehensive hashtag generation, analysis, and performance tracking capabilities for multiple social media platforms.

## Available Endpoints

### 1. POST /api/ai/hashtags/generate
Generate hashtags for social media content based on platform, content description, and target audience.

**Request Body:**
```json
{
  "platform": "INSTAGRAM",              // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, FACEBOOK
  "content": "Your content description",
  "targetAudience": "Young adults interested in tech",
  "language": "en",                   // Optional, default: 'en'
  "hashtagCount": 15,                  // Optional, platform-specific default
  "includeTrending": true,              // Optional, default: true
  "includeNiche": true,                // Optional, default: true
  "includeBroad": true                 // Optional, default: true
}
```

**Response:**
```json
{
  "success": true,
  "contentAnalysis": {
    "mainThemes": ["technology", "innovation"],
    "targetAudience": "Young adults interested in tech",
    "contentType": "educational",
    "emotionalTone": "inspiring"
  },
  "hashtags": {
    "trending": [
      {
        "hashtag": "#tech",
        "relevanceScore": 95,
        "category": "trending",
        "reason": "High relevance to content"
      }
    ],
    "niche": [...],
    "broad": [...]
  },
  "analysis": {
    "totalScore": 85,
    "categoryDistribution": {...},
    "trendingCount": 3,
    "nicheCount": 8,
    "broadCount": 4,
    "recommendations": [...],
    "issues": []
  },
  "optimization": {
    "tips": [...],
    "performancePrediction": {
      "estimatedReach": "50K-100K",
      "engagementPotential": "high",
      "bestPostingTime": "6-8 PM"
    }
  }
}
```

### 2. GET /api/ai/hashtags/trending
Get trending hashtags for a specific platform with engagement metrics and growth trends.

**Query Parameters:**
- `platform`: string (required) - Platform name
- `category`: string (optional) - Category filter
- `timeRange`: string (optional) - Time range for trends (default: 'last 7 days')
- `language`: string (optional) - Language (default: 'en')
- `limit`: number (optional) - Number of results (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "trendingOverview": {
    "totalTrendingHashtags": 25,
    "growthTrend": "rising",
    "topCategories": ["technology", "lifestyle", "entertainment"],
    "engagementLevel": "high"
  },
  "trendingHashtags": [
    {
      "hashtag": "#tech",
      "category": "technology",
      "usage": 1000000,
      "growth": 15.5,
      "engagement": 8.2,
      "posts": 50000,
      "reach": 5000000,
      "prediction": "rising",
      "bestFor": "tech content"
    }
  ],
  "categoryBreakdown": {...},
  "growthPredictions": {
    "rising": ["#tech", "#innovation"],
    "stable": ["#lifestyle"],
    "declining": ["#oldtrend"]
  },
  "usageRecommendations": {
    "bestTime": "6-8 PM",
    "combinationStrategy": "Mix trending with niche hashtags",
    "bestContentTypes": ["educational", "entertainment"]
  }
}
```

### 3. POST /api/ai/hashtags/save
Save hashtag sets with performance tracking and metadata.

**Request Body:**
```json
{
  "platform": "INSTAGRAM",
  "contentType": "video",
  "content": "Your content description",
  "hashtags": ["#tech", "#innovation", "#future"],
  "categories": {
    "trending": ["#tech"],
    "niche": ["#innovation"],
    "broad": ["#future"]
  },
  "trending": ["#tech"],
  "niche": ["#innovation"],
  "performanceMetrics": {
    "reach": 50000,
    "engagement": 2500,
    "clicks": 500
  },
  "notes": "Product launch post"
}
```

**Response:**
```json
{
  "success": true,
  "hashtagSet": {
    "id": "uuid",
    "platform": "INSTAGRAM",
    "contentType": "video",
    "hashtagCount": 3,
    "totalScore": 85,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "analysis": {
    "categoryDistribution": {...},
    "trendingCount": 1,
    "nicheCount": 1,
    "broadCount": 1,
    "recommendations": [...]
  },
  "hashtags": {
    "saved": 3,
    "updated": 0
  }
}
```

### 4. GET /api/ai/hashtags/history
Get user's hashtag generation history with pagination and filtering.

**Query Parameters:**
- `page`: number (optional) - Page number (default: 1)
- `limit`: number (optional) - Items per page (default: 20, max: 100)
- `platform`: string (optional) - Platform filter
- `contentType`: string (optional) - Content type filter
- `dateFrom`: string (optional) - Start date (ISO format)
- `dateTo`: string (optional) - End date (ISO format)
- `minScore`: number (optional) - Minimum score filter
- `maxScore`: number (optional) - Maximum score filter
- `sortBy`: string (optional) - Sort field (default: 'createdAt')
- `sortOrder`: string (optional) - Sort order (default: 'desc')

**Response:**
```json
{
  "success": true,
  "hashtagSets": [
    {
      "id": "uuid",
      "platform": "INSTAGRAM",
      "contentType": "video",
      "content": "Content description",
      "hashtags": ["#tech", "#innovation"],
      "hashtagCount": 2,
      "categories": {...},
      "trending": ["#tech"],
      "niche": ["#innovation"],
      "totalScore": 85,
      "performance": {
        "reach": 50000,
        "engagement": 2500
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalSets": 100,
    "averageScore": 78.5,
    "topPlatform": "INSTAGRAM",
    "topContentType": "video",
    "scoreDistribution": {
      "excellent": 30,
      "good": 50,
      "average": 15,
      "poor": 5
    },
    "categoryUsage": {...},
    "totalHashtags": 500
  }
}
```

### 5. GET /api/ai/hashtags/performance/[id]
Get detailed performance analytics for a specific hashtag set.

**Path Parameters:**
- `id`: string - Hashtag set ID

**Query Parameters:**
- `timeRange`: string (optional) - Time range for analytics (default: '30days')
- `metrics`: string[] (optional) - Specific metrics to include

**Response:**
```json
{
  "success": true,
  "hashtagSet": {
    "id": "uuid",
    "platform": "INSTAGRAM",
    "contentType": "video",
    "content": "Content description",
    "hashtags": ["#tech", "#innovation"],
    "createdAt": "2024-01-01T00:00:00Z",
    "totalScore": 85
  },
  "performanceMetrics": {
    "overall": {
      "reach": 50000,
      "engagement": 2500,
      "clicks": 500,
      "shares": 100,
      "saves": 50,
      "conversionRate": 1.0
    },
    "trends": [...],
    "comparison": {
      "vsPreviousPeriod": 15,
      "vsAverage": 5,
      "ranking": "Above Average"
    }
  },
  "individualHashtagPerformance": [
    {
      "hashtag": "#tech",
      "category": "trending",
      "relevanceScore": 95,
      "metrics": {
        "reach": 30000,
        "engagement": 1500,
        "clicks": 300,
        "growth": 15.5
      },
      "contribution": 1425
    }
  ],
  "insights": {
    "topPerformers": ["#tech"],
    "underperformers": [],
    "opportunities": [...],
    "recommendations": [...]
  },
  "optimization": {
    "suggestedChanges": [...],
    "predictedImprovement": {
      "reachIncrease": 20,
      "engagementIncrease": 15,
      "overallScoreIncrease": 10
    }
  }
}
```

### 6. POST /api/ai/hashtags/analyze
Analyze existing hashtags for performance, relevance, and optimization opportunities.

**Request Body:**
```json
{
  "hashtags": ["#tech", "#innovation", "#future"],
  "platform": "INSTAGRAM",
  "content": "Content context",
  "targetAudience": "Young adults",
  "language": "en",
  "includeSuggestions": true,
  "benchmark": false
}
```

**Response:**
```json
{
  "success": true,
  "overallAnalysis": {
    "strategyScore": 85,
    "strategyType": "balanced",
    "strengths": ["Good mix of categories"],
    "weaknesses": ["Could use more trending tags"]
  },
  "individualAnalysis": [
    {
      "hashtag": "#tech",
      "score": 95,
      "category": "trending",
      "performance": "high",
      "issues": [],
      "recommendation": "Keep - high performing hashtag",
      "relevanceScore": 95,
      "popularityScore": 90,
      "competitionScore": 85
    }
  ],
  "categoryBreakdown": {
    "trending": {"count": 1, "effectiveness": "high"},
    "niche": {"count": 1, "effectiveness": "medium"},
    "broad": {"count": 1, "effectiveness": "medium"}
  },
  "optimization": {
    "remove": [],
    "add": [
      {
        "hashtag": "#trending",
        "reason": "Increase discoverability",
        "category": "trending"
      }
    ],
    "modify": []
  },
  "suggestions": {
    "strategyImprovements": [...],
    "performancePrediction": {
      "current": "Good",
      "optimized": "Excellent",
      "improvement": "20% increase in engagement"
    }
  }
}
```

## Features

### Platform Support
- Instagram
- TikTok
- Twitter
- LinkedIn
- YouTube
- Facebook

### Hashtag Categories
- **Trending**: Currently popular hashtags with high reach
- **Niche**: Specific hashtags targeting particular audiences
- **Broad**: General hashtags for wide discoverability

### Analytics & Insights
- Relevance scoring based on content and platform
- Performance tracking and trend analysis
- Category distribution analysis
- Optimization recommendations
- Benchmarking against industry standards

### AI-Powered Features
- Content analysis for hashtag relevance
- Trend prediction and growth analysis
- Performance optimization suggestions
- Personalized recommendations based on user history

## Security & Rate Limiting

All endpoints include:
- User authentication validation
- Input validation and sanitization
- Error handling with appropriate HTTP status codes
- Rate limiting considerations (implementation ready)

## Database Integration

The endpoints integrate with the following database models:
- `HashtagSet`: Stores hashtag collections with metadata
- `Hashtag`: Individual hashtag data with performance metrics
- `HashtagPerformance`: Time-series performance data
- `Platform`: Platform-specific configurations
- `User`: User account and preferences

## Usage Examples

See individual endpoint documentation above for detailed request/response examples.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error description",
  "status": 400
}
```

Common error codes:
- 400: Bad Request (missing/invalid parameters)
- 401: Unauthorized (authentication required)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (unexpected issues)