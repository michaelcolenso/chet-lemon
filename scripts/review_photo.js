#!/usr/bin/env node

/**
 * Multi-Provider AI Photo Reviewer
 * Supports: Anthropic Claude, OpenAI GPT-4 Vision, Google Gemini Vision
 * Analyzes composition, lighting, exposure, subject, and creativity
 */

const fs = require('fs');
const path = require('path');

// Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'auto'; // auto, anthropic, openai, google
const MAX_TOKENS = 1024;

// API Keys
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Model configurations
const MODELS = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  google: 'gemini-1.5-flash'
};

// Photography review prompt
const REVIEW_PROMPT = `You are an expert photography critic with decades of experience in fine art, commercial, and documentary photography. Your reviews are insightful, constructive, and specific.

Analyze this photograph and provide a detailed critique. Consider:

1. **Composition** - Rule of thirds, leading lines, framing, balance, negative space
2. **Lighting** - Quality, direction, color temperature, mood, highlights/shadows
3. **Exposure** - Brightness, dynamic range, histogram distribution
4. **Subject & Focus** - Subject clarity, depth of field, focal point effectiveness
5. **Creativity & Impact** - Originality, emotional resonance, storytelling
6. **Technical Execution** - Sharpness, noise, color accuracy, post-processing

Provide your response in this exact JSON format:
{
  "overall_grade": "A letter grade from A+ to F",
  "overall_score": "Numeric score from 1-100",
  "ratings": {
    "composition": "Score 1-10",
    "lighting": "Score 1-10",
    "exposure": "Score 1-10",
    "subject": "Score 1-10",
    "creativity": "Score 1-10",
    "technical": "Score 1-10"
  },
  "strengths": ["List 2-3 specific strengths"],
  "improvements": ["List 2-3 specific areas for improvement"],
  "summary": "A concise 2-3 sentence overall assessment",
  "mood": "One word describing the mood/feeling (e.g., serene, dramatic, melancholic)",
  "style": "Photography style/genre (e.g., landscape, portrait, street, documentary)"
}

Be honest but encouraging. Focus on actionable feedback.`;

/**
 * Convert image to base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Determine media type from file extension
 */
function getMediaType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mediaTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mediaTypes[ext] || 'image/jpeg';
}

/**
 * Detect which AI provider to use
 */
function detectProvider() {
  if (AI_PROVIDER !== 'auto') {
    return AI_PROVIDER;
  }

  // Auto-detect based on available API keys
  if (ANTHROPIC_API_KEY) return 'anthropic';
  if (OPENAI_API_KEY) return 'openai';
  if (GOOGLE_API_KEY) return 'google';

  throw new Error('No AI provider API key found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY');
}

/**
 * Review photo using Anthropic Claude
 */
async function reviewWithAnthropic(imagePath) {
  const Anthropic = require('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  const imageBase64 = imageToBase64(imagePath);
  const mediaType = getMediaType(imagePath);

  const message = await client.messages.create({
    model: MODELS.anthropic,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: REVIEW_PROMPT,
          },
        ],
      },
    ],
  });

  return message.content[0].text;
}

/**
 * Review photo using OpenAI GPT-4 Vision
 */
async function reviewWithOpenAI(imagePath) {
  const OpenAI = require('openai');

  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const imageBase64 = imageToBase64(imagePath);
  const mediaType = getMediaType(imagePath);

  const response = await client.chat.completions.create({
    model: MODELS.openai,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: REVIEW_PROMPT,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mediaType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
}

/**
 * Review photo using Google Gemini
 */
async function reviewWithGoogle(imagePath) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODELS.google });

  const imageBase64 = imageToBase64(imagePath);
  const mediaType = getMediaType(imagePath);

  const result = await model.generateContent([
    REVIEW_PROMPT,
    {
      inlineData: {
        mimeType: mediaType,
        data: imageBase64
      }
    }
  ]);

  const response = await result.response;
  return response.text();
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
function parseReviewJSON(responseText) {
  // Try to extract JSON from markdown code blocks or raw text
  let jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
  if (!jsonMatch) {
    jsonMatch = responseText.match(/\{[\s\S]*\}/);
  } else {
    jsonMatch = jsonMatch[1].match(/\{[\s\S]*\}/);
  }

  if (!jsonMatch) {
    throw new Error('Could not parse JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Review a photo using the selected AI provider
 */
async function reviewPhoto(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    // Detect provider
    const provider = detectProvider();
    console.error(`Reviewing with ${provider.toUpperCase()}: ${imagePath}`);

    // Call appropriate provider
    let responseText;
    switch (provider) {
      case 'anthropic':
        if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
        responseText = await reviewWithAnthropic(imagePath);
        break;
      case 'openai':
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
        responseText = await reviewWithOpenAI(imagePath);
        break;
      case 'google':
        if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY not set');
        responseText = await reviewWithGoogle(imagePath);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    // Parse response
    const review = parseReviewJSON(responseText);

    // Add provider info
    review.ai_provider = provider;

    console.error(`✓ Review complete - Grade: ${review.overall_grade} (${review.overall_score}/100) via ${provider}`);

    return review;
  } catch (error) {
    console.error(`Error reviewing photo: ${error.message}`);
    throw error;
  }
}

/**
 * Format review as YAML front matter fields
 */
function formatAsYAML(review) {
  const yaml = [];

  yaml.push(`ai_review:`);
  yaml.push(`  overall_grade: "${review.overall_grade}"`);
  yaml.push(`  overall_score: ${review.overall_score}`);
  yaml.push(`  ratings:`);
  yaml.push(`    composition: ${review.ratings.composition}`);
  yaml.push(`    lighting: ${review.ratings.lighting}`);
  yaml.push(`    exposure: ${review.ratings.exposure}`);
  yaml.push(`    subject: ${review.ratings.subject}`);
  yaml.push(`    creativity: ${review.ratings.creativity}`);
  yaml.push(`    technical: ${review.ratings.technical}`);
  yaml.push(`  strengths:`);
  review.strengths.forEach(s => yaml.push(`    - "${s}"`));
  yaml.push(`  improvements:`);
  review.improvements.forEach(i => yaml.push(`    - "${i}"`));
  yaml.push(`  summary: "${review.summary}"`);
  yaml.push(`  mood: "${review.mood}"`);
  yaml.push(`  style: "${review.style}"`);
  yaml.push(`  provider: "${review.ai_provider}"`);

  return yaml.join('\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: review_photo.js <image_path> [--json|--yaml]');
    console.error('');
    console.error('Options:');
    console.error('  --json    Output as JSON (default)');
    console.error('  --yaml    Output as YAML for Jekyll front matter');
    console.error('');
    console.error('Environment Variables:');
    console.error('  AI_PROVIDER          Provider to use: auto, anthropic, openai, google (default: auto)');
    console.error('  ANTHROPIC_API_KEY    API key for Anthropic Claude');
    console.error('  OPENAI_API_KEY       API key for OpenAI GPT-4');
    console.error('  GOOGLE_API_KEY       API key for Google Gemini');
    process.exit(1);
  }

  const imagePath = args[0];
  const format = args[1] || '--json';

  reviewPhoto(imagePath)
    .then(review => {
      if (format === '--yaml') {
        console.log(formatAsYAML(review));
      } else {
        console.log(JSON.stringify(review, null, 2));
      }
    })
    .catch(error => {
      console.error(`Failed to review photo: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { reviewPhoto, formatAsYAML };
