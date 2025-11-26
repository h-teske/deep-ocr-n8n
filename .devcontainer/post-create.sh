#!/bin/bash
set -e

echo "🚀 Setting up Deep-OCR N8N Node Development Environment..."

# Install uv (Python package manager for Specify)
echo "📦 Installing uv package manager..."
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH for current session
export PATH="$HOME/.local/bin:$PATH"

# Install Specify CLI from GitHub Spec-kit
echo "📋 Installing GitHub Spec-kit (Specify CLI)..."
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify Specify installation
echo "✅ Verifying Specify CLI installation..."
$HOME/.local/bin/specify --version && echo "Specify installed successfully" || echo "Warning: Specify installation may have failed"

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Initialize n8n community node structure if not exists
if [ ! -f "package.json" ]; then
    echo "📁 Note: Run 'npx n8n-node-dev new' to create the n8n node structure"
fi

echo ""
echo "✨ Development environment setup complete!"
echo ""
echo "🔧 Available tools:"
echo "   - specify: GitHub Spec-kit CLI for Spec-Driven Development"
echo "   - node/npm: Node.js runtime for n8n node development"
echo "   - python/uv: Python tools for Specify"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'specify init --here --ai copilot' to initialize Spec-kit"
echo "   2. Use '/speckit.specify' to create your Deep-OCR node specification"
echo "   3. Use '/speckit.plan' to create the implementation plan"
echo "   4. Use '/speckit.tasks' to generate tasks"
echo "   5. Use '/speckit.implement' to build your n8n node"
echo ""
