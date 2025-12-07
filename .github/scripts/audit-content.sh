#!/bin/bash
set -e

SUMMARY_FILE="book/src/SUMMARY.md"
MISSING_FILE=".github/MISSING_CONTENT.md"
ISSUES=0

echo "# Missing Content Audit" > "$MISSING_FILE"
echo "Generated: $(date)" >> "$MISSING_FILE"
echo "" >> "$MISSING_FILE"

grep -o '\./[^)]*\.md' "$SUMMARY_FILE" | sed 's/^\.\///' | while read -r file; do
    filepath="book/src/$file"
    
    if [ ! -f "$filepath" ]; then
        echo "❌ Missing: $file"
        echo "- [ ] \`$file\`" >> "$MISSING_FILE"
        ISSUES=$((ISSUES + 1))
    elif [ ! -s "$filepath" ]; then
        echo "⚠️  Empty: $file"
        echo "- [ ] \`$file\` (empty)" >> "$MISSING_FILE"
        ISSUES=$((ISSUES + 1))
    elif [ $(wc -l < "$filepath" | tr -d ' ') -lt 10 ]; then
        lines=$(wc -l < "$filepath" | tr -d ' ')
        echo "⚠️  Stub: $file ($lines lines)"
        echo "- [ ] \`$file\` (stub - $lines lines)" >> "$MISSING_FILE"
        ISSUES=$((ISSUES + 1))
    fi
done

echo "" >> "$MISSING_FILE"
echo "**Total Issues: $ISSUES**" >> "$MISSING_FILE"

if [ $ISSUES -gt 0 ]; then
    echo ""
    echo "Found $ISSUES content issues"
    cat "$MISSING_FILE"
    exit 1
else
    echo "✅ All content files present"
    exit 0
fi
