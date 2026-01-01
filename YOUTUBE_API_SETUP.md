# YouTube API Setup Guide

This guide explains how to set up the YouTube Data API v3 for the BrandVoice YouTube Research feature to work properly.

## Overview

The YouTube Research page (`/dashboard/youtube-research`) uses the YouTube Data API to:
- Discover popular channels based on trending videos
- Search for channels by keyword
- Analyze channel statistics (subscribers, video count, total views)
- Extract channel metadata (description, thumbnails, country)

## Prerequisites

- A Google Cloud Project
- A valid YouTube Data API v3 key
- The API key must be enabled in your Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

If you don't have one already:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a Project" at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "BrandVoice")
5. Click "CREATE"
6. Wait for the project to be created and then select it

### 2. Enable YouTube Data API v3

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "YouTube Data API v3"
3. Click on "YouTube Data API v3"
4. Click the **ENABLE** button

### 3. Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** button
3. Select **API Key**
4. A dialog will appear with your API key
5. Copy the API key value (e.g., `AIzaSy...`)
6. Click **Close**

### 4. Add API Key to Your Environment

1. Open your `.env` file in the project root
2. Add the following line:
   ```
   YOUTUBE_API_KEY=YOUR_API_KEY_HERE
   ```
   Replace `YOUR_API_KEY_HERE` with the API key from step 3
3. Save the file
4. Restart your development server

Example `.env` setup:
```
# YouTube API
YOUTUBE_API_KEY=AIzaSyBuWG8xQeT2lYXzN_x__JyZqH8QWUsVNDU

# Other environment variables...
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
```

## API Key Security

⚠️ **Important:** Never commit your API key to version control!

- API keys in `.env` files are included in `.gitignore` by default
- Keep your API key private and don't share it publicly
- If your key is exposed, regenerate it immediately from the Google Cloud Console

### IP Restriction (Recommended for Production)

For added security in production:
1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under "Application restrictions," select **HTTP referrers (web sites)**
4. Add your domain (e.g., `https://yourdomain.com/*`)

## YouTube API Quotas

By default, your API key has:
- **10,000 quota units per day**
- Each API call costs units (typically 100-110 units per request)
- This allows approximately **90-100 API calls per day**

Common operations and their costs:
- `search` endpoint: 100 units per call
- `channels.list` endpoint: 1 unit per call
- Video fetch with statistics: 1 unit per call

To check your quota usage:
1. Go to **APIs & Services** > **Dashboard**
2. Look for "YouTube Data API v3"
3. See the "Quota" section at the bottom

## Troubleshooting

### No Channels Displayed

If you see the error message "⚠️ YouTube API not configured":
- Check that `YOUTUBE_API_KEY` is set in your `.env` file
- Ensure the API key is correctly formatted (should start with `AIzaSy...`)
- Restart your development server after adding the key

### "Access Denied" or "Invalid API Key"

- Your API key might be invalid or expired
- Regenerate a new key from the Google Cloud Console
- Make sure the YouTube Data API v3 is enabled for your project

### Empty Results or Rate Limiting

- You've exceeded your daily quota (10,000 units)
- YouTube API has rate limits on search requests
- Wait 24 hours for quotas to reset, or request a quota increase from Google Cloud Console

### Channels Not Updating in Real-Time

The YouTube research page caches results for 30 minutes. To see updated results:
- Clear the browser cache
- Modify your search query
- Change the region code or sort order

## API Features

The YouTube Research page supports:

### Channel Discovery
- **Trending Channels**: View popular channels sorted by total views or subscriber count
- **Channel Search**: Search for channels by keyword
- **Multiple Languages**: Filter by language (English, Spanish, French, etc.)

### Channel Filters
- Subscriber count range (Nano, Micro, Small, Medium, Large, Huge)
- Video count range (Starter, Active, Pro, Veteran)
- Total views range (from thousands to billions)
- Country filter
- Sorting options (views, subscribers, video count, date created)

### Channel Information Displayed
- Channel name and thumbnail
- Subscriber count (formatted as K, M, B)
- Total video count
- Total channel views
- Channel description
- Links to visit the channel

## API Endpoint

The internal API endpoint used:

```
GET /api/youtube/channels?maxResults=24&regionCode=US&order=viewCount
```

Parameters:
- `maxResults`: Number of channels to return (default: 24)
- `regionCode`: ISO 3166-1 country code (default: IN, e.g., US, GB, DE)
- `order`: Sort order (viewCount, videoCount, subscriberCount, date, relevance)
- `subscriberCountMin/Max`: Filter by subscriber range
- `videoCountMin/Max`: Filter by video count range
- `viewCountMin/Max`: Filter by total views range
- `q`: Search query (optional, empty triggers trending mode)

## Useful YouTube Data API Documentation

- [YouTube Data API v3 Overview](https://developers.google.com/youtube/v3)
- [Search: list API Reference](https://developers.google.com/youtube/v3/docs/search/list)
- [Channels: list API Reference](https://developers.google.com/youtube/v3/docs/channels/list)
- [Quota Calculator](https://developers.google.com/youtube/v3/dashboard)

## Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Check the server logs (terminal where you ran `npm run dev`)
3. Verify your API key and quota usage in Google Cloud Console
4. Test the API directly: `curl "http://localhost:3000/api/youtube/channels?maxResults=5"`

## Next Steps

Once set up, you can:
1. Go to **Dashboard** > **YouTube Research**
2. Click the **Channels** tab
3. View trending channels from your region
4. Search for specific channels
5. Apply filters to find channels matching your criteria
6. Save channels as competitors or inspiration

Enjoy using the YouTube Research feature!
