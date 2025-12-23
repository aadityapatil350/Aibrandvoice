/**
 * Thumbnail Generator Page
 * @fileoverview Main page for the AI Thumbnail Generator tool
 */

import React from 'react';
import { Metadata } from 'next';
import ThumbnailGenerator from '@/components/tools/thumbnail/ThumbnailGenerator';

export const metadata: Metadata = {
  title: 'AI Thumbnail Generator | BrandVoice',
  description: 'Generate stunning, platform-specific thumbnails with AI. Create eye-catching thumbnails for YouTube, Instagram, TikTok, LinkedIn, and more.',
};

/**
 * Thumbnail Generator page component
 */
export default function ThumbnailGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-claude-text mb-2">
          AI Thumbnail Generator
        </h1>
        <p className="text-claude-text-secondary">
          Create stunning, platform-specific thumbnails with AI. Generate eye-catching visuals that grab attention and drive engagement.
        </p>
      </div>
      
      <ThumbnailGenerator />
    </div>
  );
}