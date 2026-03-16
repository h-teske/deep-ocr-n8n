#!/bin/bash
set -e

echo "Setting up Deep-OCR N8N Node Development Environment..."

# Enable corepack for pnpm management
sudo corepack enable
corepack prepare --activate

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
pnpm install

# Build the project
echo "Building project..."
pnpm build

echo ""
echo "Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm build          - Build the node"
echo "  pnpm test           - Run tests"
echo "  pnpm test:coverage  - Run tests with coverage"
echo "  pnpm lint           - Lint source files"
echo "  pnpm dev            - Watch mode"
echo ""
