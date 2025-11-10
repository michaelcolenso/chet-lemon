# chet-lemon
# Photo Log with GitHub Pages & GitHub Actions

[![GitHub Actions Status](https://github.com/yourusername/photo-log/workflows/Process%20Images/badge.svg)](https://github.com/yourusername/photo-log/actions)
[![GitHub Pages](https://img.shields.io/badge/View-Site-brightgreen)](https://yourusername.github.io/photo-log/)

A fully automated photography blog powered by GitHub Pages, with image processing and content generation handled through GitHub Actions. Perfect for photographers and technical bloggers who want a version-controlled, automated photo journal.

## Features

- **Automated Image Processing**
  - HEIC to JPEG conversion
  - Image optimization (1920px full size, 640px thumbnails)
  - Parallel processing with Sharp library
- **AI-Powered Photo Review** 🤖 NEW!
  - **Multi-provider support**: Choose from Anthropic Claude, OpenAI GPT-4, or Google Gemini
  - **Auto-detection**: Automatically uses available API key
  - Expert photography critique with detailed analysis
  - Detailed ratings for composition, lighting, exposure, subject, creativity, and technical execution
  - Letter grades (A+ to F) and numeric scores (1-100)
  - Specific strengths and improvement suggestions
  - Automatic mood and style classification
  - Beautiful visual display on each photo post with provider badge
- **Metadata Management**
  - EXIF data extraction (DateTimeOriginal, Title, Description)
  - YAML front matter generation
  - Manual metadata override via YAML files
- **CI/CD Pipeline**
  - Automatic processing on push
  - Skip processing with commit messages
  - Atomic deployments via GitHub Pages
- **Beautiful Homepage Gallery** 🎨 NEW!
  - Responsive grid layout displaying all photos
  - AI review grades shown on thumbnails
  - Gallery statistics (total photos, reviews, average score)
  - Mini ratings preview (composition, lighting, exposure)
  - Style and mood tags on each photo card
  - Hover effects and smooth animations
  - Mobile-responsive design
- **Responsive Gallery**
  - Jekyll-powered static site
  - Lightweight markup with Liquid templates
  - Built-in RSS feed support

## Repository Structure

```bash
.
├── _originals/          # Raw images (JPG/PNG/HEIC)
├── assets/
│   ├── images/          # Processed full-size images
│   └── thumbs/          # Optimized thumbnails
├── _posts/              # Auto-generated Markdown posts
├── .github/workflows/   # CI/CD pipelines
├── _config.yml          # Jekyll configuration
└── scripts/             # Image processing utilities
```

## Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/photo-log.git
   cd photo-log
   ```

2. **Install Dependencies**
   ```bash
   # For local Jekyll development
   bundle install
   ```

3. **GitHub Pages Setup**
   - Enable GitHub Pages in repository settings (`Settings > Pages`)
     - Source: `Deploy from branch: gh-pages`
     - Folder: `/(root)`
   - Ensure GitHub Actions has write permissions

4. **AI Review Setup** 🤖

   Choose **one or more** AI providers (the system auto-detects which to use):

   **Option A: Anthropic Claude** (Recommended - Best quality)
   - Get API key from [https://console.anthropic.com/](https://console.anthropic.com/)
   - Add to repository secrets: `ANTHROPIC_API_KEY`
   - Cost: ~$0.003 per image

   **Option B: OpenAI GPT-4 Vision**
   - Get API key from [https://platform.openai.com/](https://platform.openai.com/)
   - Add to repository secrets: `OPENAI_API_KEY`
   - Cost: ~$0.005 per image

   **Option C: Google Gemini**
   - Get API key from [https://ai.google.dev/](https://ai.google.dev/)
   - Add to repository secrets: `GOOGLE_API_KEY`
   - Cost: Free tier available, ~$0.0001 per image

   **Configuration Secrets** (all optional):
   - `AI_PROVIDER`: Force specific provider (`anthropic`, `openai`, `google`, or `auto` for auto-detect)
   - `ENABLE_AI_REVIEW`: Set to `false` to disable AI reviews entirely

## Usage

### Adding New Photos

1. Place original images in `_originals/`
   ```bash
   cp ~/photos/*.{heic,jpg,png} _originals/
   ```

2. (Optional) Add metadata file `_originals/FILENAME.yml`
   ```yaml
   title: "Mountain Sunrise"
   description: "Golden light hitting snow peaks"
   date: 2024-05-20 06:30:00
   ```

3. Commit and push changes
   ```bash
   git add _originals/
   git commit -m "Add new mountain photos"
   git push
   ```

### Skipping Processing
Add `SKIP PROCESSING` to your commit message:
```bash
git commit -m "Update config [SKIP PROCESSING]"
```

## Workflow Explanation

1. **Trigger**: Push to `_originals/`
2. **Processing**:
   - HEIC → JPEG conversion (if needed)
   - Generate optimized images (1920px + 640px)
   - AI expert review (if enabled)
   - Create Jekyll posts from metadata
3. **Deployment**:
   - Commits processed assets to main branch
   - GitHub Pages automatically rebuilds site

## AI Photo Review

The AI review system supports **multiple AI providers**, giving you flexibility in cost, quality, and preference. The system automatically detects which API key is available and uses that provider.

### Supported Providers

| Provider | Model | Quality | Speed | Cost/Image | Best For |
|----------|-------|---------|-------|------------|----------|
| **Anthropic Claude** | Sonnet 4.5 | ⭐⭐⭐⭐⭐ | Fast | $0.003 | Professional reviews, best overall |
| **OpenAI GPT-4** | GPT-4o | ⭐⭐⭐⭐ | Medium | $0.005 | Detailed analysis, varied perspective |
| **Google Gemini** | Gemini 1.5 Flash | ⭐⭐⭐⭐ | Fastest | $0.0001* | Budget-conscious, high volume |

*Gemini has a generous free tier

### What It Analyzes

Each photo is evaluated across 6 key dimensions:
- **Composition** - Rule of thirds, framing, balance, visual flow
- **Lighting** - Quality, direction, mood, highlights/shadows
- **Exposure** - Brightness, dynamic range, histogram
- **Subject & Focus** - Clarity, depth of field, focal point
- **Creativity** - Originality, emotional impact, storytelling
- **Technical Execution** - Sharpness, noise, color accuracy

### Review Output

Each photo receives:
- **Overall Grade**: Letter grade from A+ to F
- **Numeric Score**: 1-100 scale
- **Individual Ratings**: 1-10 score for each dimension
- **Strengths**: 2-3 specific things done well
- **Improvements**: 2-3 actionable suggestions
- **Summary**: Concise overall assessment
- **Mood & Style**: Automatic classification

### Example Review Display

The review is beautifully integrated into each photo post with:
- Purple gradient badge showing grade and score
- Visual progress bars for each rating category
- Color-coded strengths (green) and improvements (orange)
- Style and mood tags
- Mobile-responsive design

### Cost Comparison

**Anthropic Claude:**
- 100 photos: $0.30
- 1,000 photos: $3.00

**OpenAI GPT-4:**
- 100 photos: $0.50
- 1,000 photos: $5.00

**Google Gemini:**
- 100 photos: $0.01 (or free with free tier)
- 1,000 photos: $0.10

**Tip:** Start with Gemini's free tier, upgrade to Claude for professional work

### Provider Selection

The system uses **auto-detection** by default:
1. Checks for `ANTHROPIC_API_KEY` first
2. Falls back to `OPENAI_API_KEY`
3. Falls back to `GOOGLE_API_KEY`

To force a specific provider, set the `AI_PROVIDER` secret to `anthropic`, `openai`, or `google`.

## Gallery Homepage

The homepage (`index.html`) provides a beautiful, responsive gallery view of all your photos.

### Features

**Gallery Grid**
- Responsive card-based layout (3-4 columns on desktop, 1 on mobile)
- Hover effects with image zoom and card lift
- Lazy loading for optimal performance
- 3:2 aspect ratio thumbnails

**AI Review Integration**
- Grade badges overlay on thumbnails (e.g., "A-")
- Score badges showing numeric rating
- Mini ratings for top 3 categories (Composition, Lighting, Exposure)
- Style and mood tags on each card

**Gallery Statistics**
- Total photo count
- Number of AI-reviewed photos
- Average review score across all photos
- Displayed in purple gradient badges

**Interactive Elements**
- Smooth animations on hover
- Click through to full post with complete review
- Mobile-optimized touch interactions

### Customization

Edit `index.html` to customize:

**Grid columns:**
```css
.gallery-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  /* Change 300px to adjust card size */
}
```

**Card aspect ratio:**
```css
.image-container {
  padding-bottom: 66.67%; /* 3:2 ratio */
  /* Use 100% for square, 56.25% for 16:9 */
}
```

**Color scheme:**
```css
.stat-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change to your preferred gradient */
}
```

## Customization

### Image Sizes
Modify `scripts/process_images.sh`:
```bash
# Full-size images
sharp --input "$img" --resize 1920 --output "$ASSETS_DIR/$base"

# Thumbnails
sharp --input "$img" --resize 640 --output "$THUMBS_DIR/$base"
```

### Theme Customization
1. Edit `_config.yml`:
   ```yaml
   theme: minima
   plugins:
     - jekyll-feed
     - jekyll-seo-tag
   ```

2. Modify layouts in `_layouts/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| HEIC conversion fails | Install `libheif-examples` on Ubuntu |
| Missing EXIF data | Add manual YAML metadata file |
| Images not processing | Check filename conflicts in `_posts/` |
| Thumbnails not linking | Verify asset paths in generated Markdown |
| AI review not appearing | Ensure at least one API key is set (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`) |
| AI review fails | Check GitHub Actions logs for API errors; verify API key is valid |
| Workflow timeout | AI review adds ~5-10 seconds per image; adjust timeout if needed |
| Wrong provider used | Set `AI_PROVIDER` secret to force specific provider |
| Provider not available | Install dependencies with `npm install` in scripts directory |

## FAQ

**Q: How do I update existing posts?**
A: Edit the Markdown file in `_posts/` directly

**Q: What's the storage limit?**
A: GitHub repositories have a 100GB limit. For large collections, use Git LFS.

**Q: Can I use RAW camera formats?**
A: Currently supports JPG/PNG/HEIC. Add conversion steps for RAW formats.

**Q: How much does the AI review cost?**
A: Depends on provider! Gemini is cheapest ($0.0001/image), Claude is best quality ($0.003/image), GPT-4 is middle ground ($0.005/image). See cost comparison table above.

**Q: Which AI provider should I use?**
A: **Gemini** for budget/high volume, **Claude** for best quality reviews, **GPT-4** for detailed analysis. The system auto-detects, so you can easily switch.

**Q: Can I disable AI review for specific photos?**
A: Set the environment variable `ENABLE_AI_REVIEW=false`, or remove all API key secrets to disable globally.

**Q: How do I switch between providers?**
A: Add the API key for your preferred provider to GitHub Secrets. Remove others to force that provider, or set `AI_PROVIDER` to `anthropic`, `openai`, or `google`.

**Q: Can I use multiple providers?**
A: Yes! Add multiple API keys. The system will auto-detect and use them based on priority (Claude > OpenAI > Gemini) unless you set `AI_PROVIDER`.

**Q: Can I use a different AI model?**
A: Yes! Edit `scripts/review_photo.js` and change the model in the `MODELS` object.

**Q: Will AI review work with local processing?**
A: Yes! Set any of the API key environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`) locally and run `./scripts/process_images.sh`

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add some feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open Pull Request

---

📸 Happy Shooting! [View Live Site](https://yourusername.github.io/photo-log/)
