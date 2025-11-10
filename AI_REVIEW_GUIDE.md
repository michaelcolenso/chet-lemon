# AI Photo Review Guide

This guide explains how the AI photo review system works in chet-lemon and how to customize it for your needs.

## Overview

The AI review system supports **multiple AI providers** - Anthropic Claude, OpenAI GPT-4, and Google Gemini - giving you flexibility in cost, quality, and availability. The review is automatically generated during the image processing workflow and displayed on each photo's post page.

## Multi-Provider Support (NEW!)

### Supported Providers

The system now supports three leading AI vision models:

| Provider | Model | Strengths | Cost | Speed | Quality |
|----------|-------|-----------|------|-------|---------|
| **Anthropic Claude** | Sonnet 4.5 | Best overall quality, nuanced feedback | $0.003/img | Fast | ⭐⭐⭐⭐⭐ |
| **OpenAI GPT-4** | GPT-4o | Detailed analysis, broad knowledge | $0.005/img | Medium | ⭐⭐⭐⭐ |
| **Google Gemini** | Gemini 1.5 Flash | Fast, cost-effective, free tier | $0.0001/img | Fastest | ⭐⭐⭐⭐ |

### Auto-Detection

The system automatically detects which API key is available and uses that provider:
1. Checks for `ANTHROPIC_API_KEY` first (highest priority)
2. Falls back to `OPENAI_API_KEY`
3. Falls back to `GOOGLE_API_KEY` (lowest priority)

You can override this by setting `AI_PROVIDER` to `anthropic`, `openai`, or `google`.

### Which Provider Should You Choose?

**Use Claude if:**
- You want the best quality reviews
- Budget allows ~$0.30 per 100 photos
- Professional photography portfolio

**Use GPT-4 if:**
- You want very detailed analysis
- You already have OpenAI credits
- You want a different perspective from Claude

**Use Gemini if:**
- You're processing large volumes
- You're on a tight budget
- You want to use the free tier
- Speed is most important

## How It Works

### Workflow Integration

```
Photo Upload → HEIC Conversion → Image Optimization → AI Review → Post Generation → Commit
```

When you push photos to `_originals/`:

1. **GitHub Actions** triggers the workflow
2. **Image Processing** converts and optimizes the images
3. **AI Review** sends the image to Claude API for analysis
4. **Post Generation** includes the review in YAML front matter
5. **Display** shows the review on the photo post page

### Review Process

The AI analyzes each photo considering:

- **Composition**: Rule of thirds, leading lines, framing, balance, negative space
- **Lighting**: Quality, direction, color temperature, mood, contrast
- **Exposure**: Brightness levels, dynamic range, histogram distribution
- **Subject & Focus**: Subject clarity, depth of field, focal point effectiveness
- **Creativity**: Originality, emotional resonance, storytelling elements
- **Technical Execution**: Sharpness, noise levels, color accuracy, post-processing

## Review Output

### Data Structure

The review is stored in Jekyll front matter as YAML:

```yaml
ai_review:
  overall_grade: "A-"
  overall_score: 87
  ratings:
    composition: 9
    lighting: 8
    exposure: 9
    subject: 8
    creativity: 9
    technical: 9
  strengths:
    - "Excellent use of the rule of thirds with the subject positioned perfectly"
    - "Beautiful golden hour lighting creates warmth and depth"
    - "Strong leading lines draw the viewer's eye through the composition"
  improvements:
    - "Slight overexposure in the highlights could be reduced"
    - "Consider a lower perspective to emphasize the foreground"
  summary: "A well-composed landscape shot with excellent timing and lighting. The golden hour glow adds emotional warmth, and the composition guides the viewer's eye naturally through the scene."
  mood: "serene"
  style: "landscape"
```

### Visual Display

The review is displayed with:

- **Grade Badge**: Large, prominent display of letter grade and numeric score
- **Rating Bars**: Visual progress bars for each of the 6 dimensions
- **Strengths Section**: Green-highlighted positive feedback
- **Improvements Section**: Orange-highlighted constructive suggestions
- **Tags**: Style and mood classification badges
- **Summary**: Professional critique paragraph

## Setup Instructions

### 1. Get API Key(s)

Choose one or more providers:

**Option A: Anthropic Claude** (Recommended)
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)

**Option B: OpenAI GPT-4**
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

**Option C: Google Gemini**
1. Visit [ai.google.dev](https://ai.google.dev/)
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Create a new API key
5. Copy the key

### 2. Configure GitHub Repository

1. Go to your repository on GitHub
2. Navigate to `Settings > Secrets and variables > Actions`
3. Click "New repository secret"
4. Add **one or more** of these secrets:
   - **Name**: `ANTHROPIC_API_KEY` | **Value**: Your Anthropic key
   - **Name**: `OPENAI_API_KEY` | **Value**: Your OpenAI key
   - **Name**: `GOOGLE_API_KEY` | **Value**: Your Google key

### 3. Provider Selection (Optional)

By default, the system auto-detects which provider to use based on available API keys (Claude > OpenAI > Gemini).

To force a specific provider:
- **Name**: `AI_PROVIDER`
- **Value**: `anthropic`, `openai`, or `google`

### 4. Enable/Disable Review

The AI review is **enabled by default** if any API key is present.

To disable it:
- Add repository secret:
  - **Name**: `ENABLE_AI_REVIEW`
  - **Value**: `false`

## Customization

### Changing the AI Model

Edit the `MODELS` object in `scripts/review_photo.js`:

```javascript
const MODELS = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  google: 'gemini-1.5-flash'
};
```

**Anthropic models:**
- `claude-3-5-sonnet-20241022` - Best balance (recommended)
- `claude-3-opus-20240229` - Highest quality (slower, more expensive)
- `claude-3-haiku-20240307` - Fastest and cheapest

**OpenAI models:**
- `gpt-4o` - Latest GPT-4 with vision (recommended)
- `gpt-4-turbo` - Previous generation
- `gpt-4-vision-preview` - Preview version

**Google models:**
- `gemini-1.5-flash` - Fast and efficient (recommended)
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro-vision` - Previous generation

### Customizing Review Criteria

Edit the `REVIEW_PROMPT` in `scripts/review_photo.js` to adjust:

- Which aspects to focus on
- The tone of feedback (strict vs. encouraging)
- Additional criteria (e.g., specific to wildlife, portraits, etc.)
- Output format

Example - Adding a "wildlife photography" focus:

```javascript
const REVIEW_PROMPT = `You are an expert wildlife photography critic...

Additional considerations for wildlife photography:
- Animal behavior capture
- Eye sharpness and catchlights
- Natural habitat context
- Ethical shooting practices

...rest of prompt...`;
```

### Adjusting Rating Display

Edit `_layouts/post.html` to customize:

**Change color scheme:**
```css
.grade-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change to any gradient or solid color */
}
```

**Modify rating bar colors:**
```css
.rating-fill {
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  /* Green gradient - change to your preference */
}
```

**Adjust layout:**
```css
.ratings-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* Change column count or minimum width */
}
```

### Adding Additional Metrics

You can extend the review to include more data:

1. **Edit `scripts/review_photo.js`** - Add new fields to the JSON response format
2. **Edit `_layouts/post.html`** - Display the new data

Example - Adding a "market value" estimate:

In `review_photo.js`:
```javascript
{
  ...existing fields...,
  "market_value": "Estimate if this would sell stock photography (yes/no/maybe)",
  "suggested_price": "Estimated stock photo price range ($-$$$)"
}
```

In `post.html`:
```html
{% if page.ai_review.market_value %}
  <div class="market-info">
    <strong>Stock Photography Potential:</strong> {{ page.ai_review.market_value }}
    <br>
    <strong>Suggested Price:</strong> {{ page.ai_review.suggested_price }}
  </div>
{% endif %}
```

## Cost Management

### Pricing Breakdown

**Claude Sonnet 4.5** (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Per Image Cost:**
- Image input: ~200 tokens (~$0.0006)
- Prompt: ~300 tokens (~$0.0009)
- Response: ~400 tokens (~$0.0060)
- **Total: ~$0.003 per image**

### Batch Processing Costs

| Photos | Estimated Cost |
|--------|---------------|
| 10     | $0.03         |
| 50     | $0.15         |
| 100    | $0.30         |
| 500    | $1.50         |
| 1,000  | $3.00         |

### Cost Reduction Strategies

1. **Use Haiku model** - 5x cheaper, faster, but less detailed reviews
   ```javascript
   const MODEL = 'claude-3-haiku-20240307';
   ```

2. **Disable for bulk uploads** - Set `ENABLE_AI_REVIEW=false` for large batches

3. **Selective review** - Manually review only your best shots:
   ```bash
   # Upload without review
   ENABLE_AI_REVIEW=false git commit -m "Bulk upload"

   # Later, manually review specific images
   ANTHROPIC_API_KEY=your-key node scripts/review_photo.js _originals/photo.jpg --yaml
   ```

4. **Reduce response length** - Modify `MAX_TOKENS` to limit review length

## Local Testing

Test the review system locally before pushing:

```bash
# Set API key
export ANTHROPIC_API_KEY='your-key-here'

# Review a single photo
node scripts/review_photo.js path/to/photo.jpg

# Get YAML output (for Jekyll front matter)
node scripts/review_photo.js path/to/photo.jpg --yaml

# Process all photos with reviews
./scripts/process_images.sh
```

## Troubleshooting

### Issue: "Error: ANTHROPIC_API_KEY environment variable not set"

**Solution:** Ensure the secret is added to GitHub repository or set locally:
```bash
export ANTHROPIC_API_KEY='your-key'
```

### Issue: API rate limits exceeded

**Solution:**
- Anthropic has generous rate limits (default: 50 requests/minute)
- For bulk processing, add delays between reviews
- Contact Anthropic support for higher limits if needed

### Issue: Review not appearing on post page

**Possible causes:**
1. API key not set - Check GitHub Secrets
2. Script failed silently - Check GitHub Actions logs
3. YAML parsing error - Validate generated post front matter
4. Template issue - Verify `{% if page.ai_review %}` in post.html

**Debug:**
```bash
# Check generated post file
cat _posts/YYYY-MM-DD-filename.md

# Should contain ai_review: section with all data
```

### Issue: "Could not parse JSON from AI response"

**Solution:**
- Model might return non-JSON text
- Check `scripts/review_photo.js` error logs
- Verify Claude is returning expected format
- Try with a simpler test image first

### Issue: Different reviews for same photo

This is normal! AI models have some variability. If you need consistent reviews:
- Cache review results and don't regenerate
- Use temperature=0 in API call (add to `scripts/review_photo.js`)

## Advanced Features

### Multi-Language Support

Modify the prompt to request reviews in different languages:

```javascript
const REVIEW_PROMPT = `You are an expert photography critic. Provide your review in Spanish.

Analiza esta fotografía y proporciona una crítica detallada...`;
```

### Custom Grading Scales

Change from letter grades to stars, numbers, or custom scales:

```javascript
// In review_photo.js
{
  "overall_grade": "4.5/5 stars",  // Instead of "A-"
  "overall_score": 90
}
```

### Integration with Other Services

The review data can be exported to:
- **Google Sheets** - Track photo performance over time
- **Portfolio sites** - Display reviews on external websites
- **Social media** - Auto-generate captions with review highlights
- **Photo management apps** - Sync reviews to Lightroom/Capture One

## Example Reviews

### Landscape Photo

```
Grade: A-
Score: 87/100

Composition: 9/10 | Lighting: 8/10 | Exposure: 9/10
Subject: 8/10 | Creativity: 9/10 | Technical: 9/10

Strengths:
• Excellent use of the rule of thirds with perfectly positioned horizon
• Beautiful golden hour lighting creates warmth and depth
• Strong leading lines from the path draw viewer's eye through scene

Improvements:
• Slight overexposure in sky highlights could be reduced
• Consider deeper depth of field for sharper foreground details

Style: landscape | Mood: serene
```

### Portrait Photo

```
Grade: B+
Score: 78/100

Composition: 7/10 | Lighting: 9/10 | Exposure: 8/10
Subject: 8/10 | Creativity: 7/10 | Technical: 7/10

Strengths:
• Soft natural window light beautifully sculpts the subject's features
• Excellent eye contact and genuine expression creates connection
• Clean background keeps focus on subject

Improvements:
• Composition could benefit from more negative space on left
• Slight chromatic aberration visible in high-contrast edges
• Consider subtle fill light to brighten shadows under chin

Style: portrait | Mood: contemplative
```

## Privacy & Data

- **Images are sent to Anthropic's API** for analysis
- Anthropic does not train on your images (as of 2025 policy)
- Reviews are stored in your GitHub repository
- No third-party services besides Anthropic are used
- All processing happens in GitHub Actions (serverless)

For maximum privacy:
- Self-host the review system
- Use local AI models (requires significant setup)
- Disable AI review and manually write critiques

## Support

For issues specific to:
- **AI review feature**: Open issue on this repository
- **Anthropic API**: Contact [Anthropic support](https://support.anthropic.com/)
- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/actions)

---

Happy shooting and happy reviewing! 📸🤖
