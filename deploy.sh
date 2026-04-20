#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Load user profile to ensure tools like nvm, yarn, and pm2 are in the PATH
# Non-interactive SSH sessions often don't load these by default.
[ -f "$HOME/.profile" ] && source "$HOME/.profile"
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile"
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc"
[ -f "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

echo "🚀 Starting Deployment..."

echo "📦 Installing dependencies..."
yarn install

echo "🏗️ Building the project..."
yarn build

echo "🔄 Restarting application with PM2..."
pm2 restart all || pm2 start npm --name "dragbizz-store-fe" -- start

echo "💾 Saving PM2 state..."
pm2 save

echo "✅ Deployment completed successfully!"