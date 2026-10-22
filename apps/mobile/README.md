# Banter Mobile

Expo + React Native + TypeScript mobile client for Banter.

## Development

From the repository root:

\`\`\`bash
pnpm install
pnpm --filter @banter/mobile start
\`\`\`

Useful scripts:

- \`pnpm --filter @banter/mobile android\`
- \`pnpm --filter @banter/mobile ios\` (requires macOS for native iOS builds)
- \`pnpm --filter @banter/mobile typecheck\`

## Current milestone

The login and signup screens are UI-only. They include reusable fields, local form validation, keyboard-aware scrolling, and accessible controls. Authentication requests, session persistence, password recovery, and navigation infrastructure are intentionally not connected yet; those will be added in separate steps after the UI is reviewed.

## Structure

- \`src/app\`: app-level screen composition
- \`src/components\`: reusable UI components
- \`src/features/auth/screens\`: login and signup screens
- \`src/features/auth/components\`: authentication layout
- \`src/features/auth/validation.ts\`: local input validation
- \`src/theme\`: design tokens