# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

chet-lemon is an automated photography blog system powered by GitHub Pages and Jekyll. It features AI-powered photo reviews using multiple vision AI providers (Anthropic Claude, OpenAI GPT-4, Google Gemini). Photos are automatically processed, optimized, reviewed, and published through a GitHub Actions CI/CD pipeline.

## Key Commands

### Development
```bash
# Install Jekyll dependencies (for local development)
bundle install

# Run Jekyll locally
bundle exec jekyll serve

# Install Node.js dependencies for AI review scripts
cd scripts && npm install
```

### Image Processing
```bash
# Process all images in _originals/ (includes AI review if API key set)
./scripts/process_images.sh

# Review a single photo with AI (outputs JSON)
node scripts/review_photo.js path/to/photo.jpg

# Review and get YAML output for Jekyll front matter
node scripts/review_photo.js path/to/photo.jpg --yaml

# Set environment variable to use specific AI provider
export AI_PROVIDER=anthropic  # or 'openai', 'google', 'auto'
export ANTHROPIC_API_KEY='your-key-here'
./scripts/process_images.sh
```

### Git Workflow
```bash
# Add new photos
cp ~/photos/*.jpg _originals/
git add _originals/
git commit -m "Add new photos"
git push  # Triggers GitHub Actions workflow

# Skip automated processing
git commit -m "Update config [SKIP PROCESSING]"
```

## Architecture

### Automated Image Pipeline

The system follows this workflow when photos are pushed to `_originals/`:

1. **GitHub Actions Trigger** (`.github/workflows/process-images.yml`)
   - Monitors `_originals/**/*.{jpg,png,heic}` for changes
   - Installs dependencies (ImageMagick, exiftool, Sharp, Node packages)
   - Sets up AI provider API keys from GitHub Secrets

2. **Image Processing** (`scripts/process_images.sh`)
   - Converts HEIC → JPEG if needed
   - Generates optimized full-size images (1920px) → `assets/images/`
   - Creates thumbnails (640px) → `assets/thumbs/`
   - Extracts EXIF metadata (DateTimeOriginal, Title, Description)

3. **AI Photo Review** (`scripts/review_photo.js`)
   - Multi-provider support with auto-detection:
     - Priority order: Anthropic Claude → OpenAI GPT-4 → Google Gemini
     - Falls back based on which API key is available
   - Analyzes 6 dimensions: composition, lighting, exposure, subject, creativity, technical
   - Returns structured review with grades (A+ to F), numeric scores (1-100), ratings (1-10 per dimension), strengths, improvements, summary, mood, and style
   - Review stored in Jekyll post front matter as YAML

4. **Post Generation**
   - Creates Markdown file in `_posts/` with YYYY-MM-DD-filename.md format
   - YAML front matter includes image paths, metadata, and AI review
   - Posts are automatically published via Jekyll on GitHub Pages

5. **Display**
   - Individual posts use `_layouts/post.html` template
   - AI reviews rendered with visual grade badges, progress bars, and color-coded feedback
   - Homepage (`index.html`) displays responsive gallery grid with review overlays

### Multi-Provider AI Review System

The `review_photo.js` script supports three AI providers:

- **Anthropic Claude Sonnet 4.5**: Best quality, recommended for professional work (~$0.003/image)
- **OpenAI GPT-4o**: Detailed analysis, alternative perspective (~$0.005/image)
- **Google Gemini 1.5 Flash**: Fast and cost-effective, free tier available (~$0.0001/image)

**Auto-detection logic**:
- Checks `AI_PROVIDER` env var (can be 'auto', 'anthropic', 'openai', 'google')
- If 'auto', checks for API keys in priority order: `ANTHROPIC_API_KEY` → `OPENAI_API_KEY` → `GOOGLE_API_KEY`
- Uses first available provider

**Review prompt** (`scripts/review_photo.js:29-59`):
- Consistent across all providers
- Requests JSON format response
- Evaluates 6 photography dimensions with specific criteria
- Returns structured data: grades, scores, ratings, strengths, improvements, summary, mood, style

### Jekyll Structure

- `_config.yml`: Jekyll configuration, uses Minima theme with jekyll-feed plugin
- `_layouts/post.html`: Template for individual photo posts with AI review display
- `index.html`: Gallery homepage with grid layout, statistics, and AI review overlays
- `_posts/`: Auto-generated Markdown posts (never edit manually, regenerated from `_originals/`)
- `assets/images/`: Full-size optimized images (1920px)
- `assets/thumbs/`: Thumbnail images (640px)

## Important Conventions

### File Management
- **Never manually edit files in `_posts/`, `assets/images/`, or `assets/thumbs/`** - these are auto-generated
- Original photos always go in `_originals/` directory
- Optional: Create `_originals/filename.yml` to override EXIF metadata with custom title, description, or date
- Posts are idempotent: if a post already exists for an image, processing is skipped

### AI Review Configuration
- **GitHub Secrets** (for CI/CD):
  - `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`: One or more AI provider keys
  - `AI_PROVIDER`: Optional, force specific provider ('anthropic', 'openai', 'google', 'auto')
  - `ENABLE_AI_REVIEW`: Optional, set to 'false' to disable reviews
- **Local environment variables** (for development):
  - Same as GitHub Secrets, set via `export` commands

### Customization Points

**Change AI models** (`scripts/review_photo.js:22-26`):
```javascript
const MODELS = {
  anthropic: 'claude-3-5-sonnet-20241022',  // or claude-3-opus, claude-3-haiku
  openai: 'gpt-4o',                          // or gpt-4-turbo, gpt-4-vision-preview
  google: 'gemini-1.5-flash'                 // or gemini-1.5-pro, gemini-pro-vision
};
```

**Modify review criteria** (`scripts/review_photo.js:28-59`):
Edit the `REVIEW_PROMPT` constant to adjust focus areas, tone, or output format

**Adjust image sizes** (`scripts/process_images.sh:45-52`):
Change `--resize` parameters in Sharp commands for different dimensions

**Theme customization**:
- Color schemes in `_layouts/post.html` (lines 99-238) and `index.html` (lines 88+)
- Gallery layout in `index.html` - adjust grid columns, card aspect ratios, hover effects

## Testing Locally

To test the full pipeline locally before pushing:

1. Set API key: `export ANTHROPIC_API_KEY='your-key'`
2. Add photos to `_originals/`
3. Run: `./scripts/process_images.sh`
4. Start Jekyll: `bundle exec jekyll serve`
5. View at: `http://localhost:4000`

## Debugging

**Check GitHub Actions logs**: Go to Actions tab on GitHub to see processing output

**Verify AI review in post**:
```bash
cat _posts/YYYY-MM-DD-filename.md
# Should contain ai_review: section with all fields
```

**Test review script directly**:
```bash
node scripts/review_photo.js _originals/photo.jpg
# Should output JSON review
```

**Common issues**:
- AI review not appearing: Check that at least one API key secret is set
- Wrong provider used: Set `AI_PROVIDER` to force specific provider
- Posts not updating: Delete post file in `_posts/` to force regeneration
- Images not displaying: Check paths in Jekyll posts match `assets/images/` and `assets/thumbs/`
