#!/usr/bin/env node

/**
 * AI Photo Reviewer
 * Uses Claude (Anthropic API) to provide expert photography critique
 * Analyzes composition, lighting, exposure, subject, and creativity
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 1024;

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set');
  process.exit(1);
}

const client = new Anthropic({
  apiKey: API_KEY,
});

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
 * Review a photo using Claude Vision API
 */
async function reviewPhoto(imagePath) {
  try {
    console.error(`Reviewing: ${imagePath}`);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    // Convert image to base64
    const imageBase64 = imageToBase64(imagePath);
    const mediaType = getMediaType(imagePath);

    // Call Claude API
    const message = await client.messages.create({
      model: MODEL,
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

    // Extract response
    const responseText = message.content[0].text;

    // Parse JSON from response
    // Claude might wrap JSON in markdown code blocks, so we need to extract it
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const review = JSON.parse(jsonMatch[0]);

    console.error(`✓ Review complete - Grade: ${review.overall_grade} (${review.overall_score}/100)`);

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
