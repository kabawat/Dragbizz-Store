#!/bin/bash

echo "🚀 Starting Deployment..."

echo "📦 Installing dependencies..."
yarn install &&

echo "🏗️ Building the project..."
yarn build && 

echo "🔄 Restarting all PM2 processes..."
pm2 restart all && 

echo "💾 Saving PM2 state..."
pm2 save

echo "✅ Deployment completed successfully!"