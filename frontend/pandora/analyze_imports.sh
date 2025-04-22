#!/bin/bash

# Simple script to analyze imports in a JS/JSX file
FILE=$1

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file_path>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

echo "Analyzing imports in $FILE"
echo "--------------------------"
grep -n "import .* from" "$FILE" | sed 's/^\([0-9]*\):/Line \1: /'
echo "--------------------------"

# Extract specific component imports
echo "Looking for specific component imports:"
grep -n "import.*OptimizedProformaView" "$FILE" | sed 's/^\([0-9]*\):/Line \1: /'
grep -n "import.*EnhancedProforma" "$FILE" | sed 's/^\([0-9]*\):/Line \1: /'

# Check for lazy imports that might be causing issues
echo "--------------------------"
echo "Checking lazy imports:"
grep -n "lazy(() => import(" "$FILE" | sed 's/^\([0-9]*\):/Line \1: /'