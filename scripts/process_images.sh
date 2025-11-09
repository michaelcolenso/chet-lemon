#!/bin/bash

set -e  # Exit on error

ORIGINALS_DIR="_originals"
POSTS_DIR="_posts"
ASSETS_DIR="assets/images"
THUMBS_DIR="assets/thumbs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create directories if they don't exist
mkdir -p "$POSTS_DIR" "$ASSETS_DIR" "$THUMBS_DIR"

# Check if AI review is enabled
ENABLE_AI_REVIEW="${ENABLE_AI_REVIEW:-true}"

echo "Starting image processing..."
echo "AI Review: $ENABLE_AI_REVIEW"

find "$ORIGINALS_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.heic" \) 2>/dev/null | while read -r img; do
  base=$(basename "$img")
  name="${base%.*}"
  yaml="$ORIGINALS_DIR/$name.yml"
  post_date=$(date -r "$img" +"%Y-%m-%d" 2>/dev/null || date +"%Y-%m-%d")
  post_file="$POSTS_DIR/${post_date}-${name}.md"

  # Skip if already processed
  if [ -f "$post_file" ]; then
    echo "⏭️  Skipping $base (already processed)"
    continue
  fi

  echo "📸 Processing: $base"

  # Convert HEIC to JPEG if needed
  if [[ "$base" == *.heic ]] || [[ "$base" == *.HEIC ]]; then
    echo "   Converting HEIC to JPEG..."
    mogrify -format jpg "$img"
    img="${img%.*}.jpg"
    base="$name.jpg"
  fi

  # Create optimized versions
  echo "   Generating optimized images..."
  sharp --input "$img" --resize 1920 --output "$ASSETS_DIR/$base" 2>/dev/null || {
    echo "   ⚠️  Sharp failed, copying original..."
    cp "$img" "$ASSETS_DIR/$base"
  }
  sharp --input "$img" --resize 640 --output "$THUMBS_DIR/$base" 2>/dev/null || {
    echo "   ⚠️  Sharp failed for thumbnail, copying original..."
    cp "$img" "$THUMBS_DIR/$base"
  }

  # Extract metadata
  echo "   Extracting EXIF metadata..."
  if [ -f "$yaml" ]; then
    metadata=$(cat "$yaml")
  else
    metadata=$(exiftool -d "%Y-%m-%d %H:%M:%S" -DateTimeOriginal -Title -Description -s3 "$img" 2>/dev/null || echo "")
  fi

  # AI Review
  ai_review=""
  if [ "$ENABLE_AI_REVIEW" = "true" ] && [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "   🤖 Getting AI expert review..."
    if ai_review=$(node "$SCRIPT_DIR/review_photo.js" "$img" --yaml 2>/dev/null); then
      echo "   ✓ AI review complete"
    else
      echo "   ⚠️  AI review failed (will continue without it)"
      ai_review=""
    fi
  elif [ "$ENABLE_AI_REVIEW" = "true" ]; then
    echo "   ⚠️  AI review enabled but ANTHROPIC_API_KEY not set"
  fi

  # Generate Jekyll post
  echo "   Creating Jekyll post..."
  {
    echo "---"
    echo "layout: post"
    if [ -n "$metadata" ]; then
      echo "$metadata" | awk '{print $0}'
    fi
    echo "image: /$ASSETS_DIR/$base"
    echo "thumb: /$THUMBS_DIR/$base"
    if [ -n "$ai_review" ]; then
      echo "$ai_review"
    fi
    echo "---"
  } > "$post_file"

  git add "$post_file" "$ASSETS_DIR/$base" "$THUMBS_DIR/$base" 2>/dev/null || true

  echo "   ✅ Done: $base"
  echo ""
done

echo "🎉 Image processing complete!"
