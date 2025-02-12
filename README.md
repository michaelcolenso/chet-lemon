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
- **Metadata Management**
  - EXIF data extraction (DateTimeOriginal, Title, Description)
  - YAML front matter generation
  - Manual metadata override via YAML files
- **CI/CD Pipeline**
  - Automatic processing on push
  - Skip processing with commit messages
  - Atomic deployments via GitHub Pages
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
   - Create Jekyll posts from metadata
3. **Deployment**:
   - Commits processed assets to main branch
   - GitHub Pages automatically rebuilds site

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

## FAQ

**Q: How do I update existing posts?**  
A: Edit the Markdown file in `_posts/` directly

**Q: What's the storage limit?**  
A: GitHub repositories have a 100GB limit. For large collections, use Git LFS.

**Q: Can I use RAW camera formats?**  
A: Currently supports JPG/PNG/HEIC. Add conversion steps for RAW formats.

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
