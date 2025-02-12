#!/bin/bash

ORIGINALS_DIR="_originals"
POSTS_DIR="_posts"
ASSETS_DIR="assets/images"
THUMBS_DIR="assets/thumbs"

find "$ORIGINALS_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.heic" \) | while read -r img; do
  base=$(basename "$img")
  name="${base%.*}"
  yaml="$ORIGINALS_DIR/$name.yml"
  
  # Skip if already processed
  if [ -f "$POSTS_DIR/${name}.md" ]; then continue; fi

  # Convert HEIC to JPEG if needed
  if [[ "$base" == *.heic ]]; then
    mogrify -format jpg "$img"
    img="${img%.*}.jpg"
    base="$name.jpg"
  fi

  # Create optimized versions
  sharp --input "$img" --resize 1920 --output "$ASSETS_DIR/$base"
  sharp --input "$img" --resize 640 --output "$THUMBS_DIR/$base"

  # Extract metadata
  if [ -f "$yaml" ]; then
    metadata=$(cat "$yaml")
  else
    metadata=$(exiftool -d "%Y-%m-%d %H:%M:%S" -DateTimeOriginal -Title -Description -s3 "$img")
  fi

  # Generate Jekyll post
  cat << EOF > "$POSTS_DIR/$(date -r "$img" +"%Y-%m-%d")-$name.md"
---
layout: post
$(echo "$metadata" | awk '{print "  " $0}')
image: /$ASSETS_DIR/$base
thumb: /$THUMBS_DIR/$base
---
EOF

  git add "$POSTS_DIR/$(date -r "$img" +"%Y-%m-%d")-$name.md"
done
