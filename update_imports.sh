#!/bin/bash

# Find all files that import from @/utils/helpers
FILES=$(find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/utils/helpers")

# Loop through each file and update the import
for file in $FILES; do
  echo "Updating $file"
  sed -i '' 's|@/utils/helpers|@/utils/formatUtils|g' "$file"
done

echo "All files updated!"
