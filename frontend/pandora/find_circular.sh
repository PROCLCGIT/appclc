#!/bin/bash

# Path to project src directory
SRC_DIR="/Users/clc/WS/appclc/frontend/pandora/src"

echo "Scanning for potential circular dependencies..."

# Find all JS and JSX files
find "$SRC_DIR" -type f -name "*.js" -o -name "*.jsx" | while read -r file; do
  # Extract filename without path and extension
  filename=$(basename "$file" | sed 's/\.[^.]*$//')
  
  # Find files that import this file
  importers=$(grep -l "import.*from.*$filename" $(find "$SRC_DIR" -type f -name "*.js" -o -name "*.jsx"))
  
  # For each importer, check if the original file imports it back
  if [ ! -z "$importers" ]; then
    while read -r importer; do
      importer_filename=$(basename "$importer" | sed 's/\.[^.]*$//')
      
      # Check if original file imports the importer
      if grep -q "import.*from.*$importer_filename" "$file"; then
        echo "CIRCULAR DEPENDENCY DETECTED:"
        echo "  File: $file"
        echo "  imports from: $importer"
        echo "  which imports from: $file"
        echo ""
      fi
    done <<< "$importers"
  fi
done

echo "Scan complete."