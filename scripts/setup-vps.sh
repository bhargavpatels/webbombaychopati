#!/bin/bash

# Setup script for Hostinger VPS
# Run this script on your VPS after connecting via SSH

echo "Setting up VPS environment for Ice Cream Express Delivery..."

# Update package lists
echo "Updating package lists..."
sudo apt update

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Create website directory
echo "Creating website directory..."
sudo mkdir -p /var/www/html/icecream-express
sudo chown -R $USER:$USER /var/www/html/icecream-express

# Create Nginx configuration
echo "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/icecream-express > /dev/null << 'EOF'
server {
    listen 80;
    listen 8443;
    server_name 82.112.230.90 web.shribombaychowpati.com;
    root /var/www/html/icecream-express;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Enable the site
echo "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/icecream-express /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "VPS setup completed successfully!"
echo "Next steps:"
echo "1. Run 'npm run deploy' from your local machine" 