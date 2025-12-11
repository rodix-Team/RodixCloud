#!/bin/bash
# 🚀 Deployment Script for Hostinger/VPS
# =====================================

set -e  # Exit on error

echo "=========================================="
echo "🚀 AI Recommendation API - Deployment"
echo "=========================================="
echo ""

# Configuration
APP_DIR="/home/$(whoami)/recommender-api"
SERVICE_NAME="recommender-api"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check requirements
echo "📋 Step 1: Checking requirements..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Installing..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

if ! command -v nginx &> /dev/null; then
    echo "❌ NGINX not found. Installing..."
    sudo apt install -y nginx
fi

echo -e "${GREEN}✓${NC} Requirements OK"
echo ""

# Step 2: Create directories
echo "📁 Step 2: Creating directories..."

mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p /var/lib/recommender
sudo chown -R $(whoami):$(whoami) /var/lib/recommender

echo -e "${GREEN}✓${NC} Directories created"
echo ""

# Step 3: Copy files
echo "📦 Step 3: Uploading files..."
echo -e "${YELLOW}⚠️${NC}  Please upload files manually:"
echo "  - app.py → $APP_DIR/"
echo "  - recommender_system.py → $APP_DIR/"
echo "  - requirements.txt → $APP_DIR/"
echo "  - .env.production → $APP_DIR/.env"
echo ""
read -p "Press Enter when files are uploaded..."

# Step 4: Install Python dependencies
echo "🐍 Step 4: Installing Python dependencies..."

cd $APP_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 5: Create systemd service
echo "⚙️  Step 5: Creating systemd service..."

sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=AI Recommendation API
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
ExecStart=$APP_DIR/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 4 --timeout 120 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo -e "${GREEN}✓${NC} Service created and started"
echo ""

# Step 6: Configure NGINX
echo "🌐 Step 6: Configuring NGINX..."

DOMAIN="api.yourdomain.com"  # Update this
echo "Enter your API domain (e.g., api.yourdomain.com):"
read -p "Domain: " DOMAIN

sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✓${NC} NGINX configured"
echo ""

# Step 7: SSL (optional)
echo "🔒 Step 7: Setting up SSL (optional)..."
echo "Do you want to install SSL certificate? (y/n)"
read -p "Install SSL? " install_ssl

if [ "$install_ssl" == "y" ]; then
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    sudo certbot --nginx -d $DOMAIN
    echo -e "${GREEN}✓${NC} SSL configured"
else
    echo "⏭️  Skipping SSL"
fi

echo ""

# Step 8: Test
echo "🧪 Step 8: Testing API..."

sleep 2
response=$(curl -s http://localhost:5000/health)

if [[ $response == *"healthy"* ]]; then
    echo -e "${GREEN}✓${NC} API is healthy!"
else
    echo -e "${YELLOW}⚠️${NC}  API might have issues. Check logs:"
    echo "  sudo journalctl -u $SERVICE_NAME -f"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📍 API URL: http://$DOMAIN"
echo "🔍 Health: http://$DOMAIN/health"
echo "📊 Stats: http://$DOMAIN/api/stats"
echo ""
echo "📋 Useful commands:"
echo "  - Check status: sudo systemctl status $SERVICE_NAME"
echo "  - View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  - Restart: sudo systemctl restart $SERVICE_NAME"
echo ""
