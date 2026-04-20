set -e

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