#!/bin/bash

FILE=$1
TITLE=$(basename "$FILE" .md | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

cat > "book/src/$FILE" << EOF
# $TITLE

> 🚧 This section is under development

## Overview

This chapter covers $TITLE in the context of modern Swift and iOS development.

## Key Concepts

- Concept 1
- Concept 2
- Concept 3

## Implementation

\`\`\`swift
// Example code coming soon
\`\`\`

## Best Practices

- Best practice 1
- Best practice 2
- Best practice 3

## Resources

- [Apple Documentation](https://developer.apple.com)
- [Swift.org](https://swift.org)

## Next Steps

Continue to the next chapter to learn more.
EOF

echo "✅ Created stub: $FILE"
