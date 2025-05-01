# Deployment Guide for Hostinger VPS

This guide will help you deploy your Ice Cream Express Delivery application to a Hostinger VPS.

## Prerequisites

- A Hostinger VPS account
- SSH access to your VPS
- Node.js and npm installed on your local machine
- Git installed on your local machine

## VPS Information

- **IP Address**: 82.112.230.90
- **Domain**: web.shribombaychowpati.com
- **Port**: 8443 (in addition to standard port 80)
- **Username**: root (default)

## Step 1: Prepare Your VPS

1. **Access your Hostinger VPS**:
   - Log in to your Hostinger control panel
   - Navigate to the VPS section
   - Connect to your VPS using SSH: `ssh root@82.112.230.90`

2. **Set up SSH access** (recommended for secure deployment):
   ```bash
   # On your local machine
   ssh-keygen -t rsa -b 4096
   # Copy your public key
   cat ~/.ssh/id_rsa.pub
   ```
   - Add this public key to your VPS's authorized_keys file

3. **Run the setup script**:
   - Upload the `scripts/setup-vps.sh` file to your VPS
   - Make it executable: `chmod +x setup-vps.sh`
   - Run it: `./setup-vps.sh`

   This script will:
   - Install Nginx, Node.js, and PM2
   - Create the website directory
   - Configure Nginx to serve your application on ports 80 and 8443
   - Set up the domain and IP address

## Step 2: Configure Your Deployment Script

The deployment script (`scripts/deploy.js`) has been configured with your VPS details:
```javascript
const config = {
  host: '82.112.230.90', // VPS IP address
  domain: 'web.shribombaychowpati.com', // Domain name
  username: 'root', // VPS username
  remotePath: '/var/www/html/icecream-express', // Website directory
  sshKeyPath: '~/.ssh/id_rsa' // SSH key path
};
```

## Step 3: Deploy Your Application

1. **Run the deployment script**:
   ```bash
   npm run deploy
   ```

   This will:
   - Build your application
   - Create a deployment package
   - Upload it to your VPS
   - Extract it to your website directory

2. **Verify the deployment**:
   - Visit your domain in a web browser: https://web.shribombaychowpati.com
   - Or visit your IP address: http://82.112.230.90:8443
   - Check that your application is working correctly

## Step 4: Set Up SSL (Optional but Recommended)

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain an SSL certificate**:
   ```bash
   sudo certbot --nginx -d web.shribombaychowpati.com
   ```

3. **Follow the prompts to complete the SSL setup**

## Troubleshooting

- **If you encounter permission issues**:
  ```bash
  sudo chown -R $USER:$USER /var/www/html/icecream-express
  ```

- **If Nginx fails to start**:
  ```bash
  sudo nginx -t
  ```
  Check the output for errors and fix them in your configuration file.

- **If your application doesn't load**:
  - Check the Nginx error logs:
    ```bash
    sudo tail -f /var/log/nginx/error.log
    ```
  - Ensure your application's build files are in the correct directory
  - Verify that your API endpoints are correctly configured in the `.env.production` file

## Continuous Deployment

For continuous deployment, consider setting up a GitHub Actions workflow or using a CI/CD service like Jenkins or GitLab CI. 