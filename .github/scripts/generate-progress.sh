#!/bin/bash

SUMMARY_FILE="book/src/SUMMARY.md"
PROGRESS_FILE="PROGRESS.md"

TOTAL=0
COMPLETE=0
STUB=0
MISSING=0

echo "# Course Progress Dashboard" > "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"
echo "Last Updated: $(date)" >> "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"

grep -oP '\(\.\/[^)]+\.md\)' "$SUMMARY_FILE" | sed 's/[()]//g' | sed 's/^\.\///' | while read -r file; do
    ((TOTAL++))
    filepath="book/src/$file"
    
    if [ ! -f "$filepath" ]; then
        ((MISSING++))
    elif [ ! -s "$filepath" ]; then
        ((STUB++))
    elif [ $(wc -l < "$filepath") -lt 20 ]; then
        ((STUB++))
    else
        ((COMPLETE++))
    fi
done

PERCENT=$((COMPLETE * 100 / TOTAL))

echo "## Overall Progress" >> "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"
echo "![Progress](https://progress-bar.dev/$PERCENT/?title=Complete&width=400)" >> "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"
echo "- ✅ Complete: $COMPLETE" >> "$PROGRESS_FILE"
echo "- 🚧 Stubs: $STUB" >> "$PROGRESS_FILE"
echo "- ❌ Missing: $MISSING" >> "$PROGRESS_FILE"
echo "- 📊 Total: $TOTAL" >> "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"
echo "**Completion Rate: ${PERCENT}%**" >> "$PROGRESS_FILE"

echo "Progress: $COMPLETE/$TOTAL ($PERCENT%)"
