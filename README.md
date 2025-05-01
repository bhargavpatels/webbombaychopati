# Ice Cream Express Delivery App

A modern web application for managing ice cream deliveries with React, TypeScript, and shadcn-ui.

## Local Development

Follow these steps to set up the project locally:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deployment to Hostinger VPS

### Prerequisites

1. A Hostinger VPS server with SSH access
2. Node.js and npm installed on your local machine
3. SSH key set up for authentication (recommended)

### Step 1: Configure the Deployment Script

Edit the `scripts/deploy.js` file and update the configuration:

```javascript
const config = {
  host: 'YOUR_HOSTINGER_VPS_IP_OR_DOMAIN', // Example: 123.456.789.012 or yourdomain.com
  username: 'YOUR_VPS_USERNAME', // Example: root or admin
  remotePath: '/var/www/html/YOUR_WEBSITE_DIRECTORY', // Example: /var/www/html/icecream-app
  sshKeyPath: '~/.ssh/id_rsa' // Path to your SSH key
};
```

### Step 2: Prepare Your VPS Server

1. Log in to your Hostinger VPS via SSH:
   ```
   ssh YOUR_USERNAME@YOUR_VPS_IP
   ```

2. Install Nginx (if not already installed):
   ```
   sudo apt update
   sudo apt install nginx
   ```

3. Create a directory for your app:
   ```
   sudo mkdir -p /var/www/html/YOUR_WEBSITE_DIRECTORY
   sudo chown -R $USER:$USER /var/www/html/YOUR_WEBSITE_DIRECTORY
   sudo chmod -R 755 /var/www/html/YOUR_WEBSITE_DIRECTORY
   ```

4. Configure Nginx to serve your app:
   ```
   sudo nano /etc/nginx/sites-available/YOUR_WEBSITE_NAME
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name YOUR_DOMAIN_OR_IP;

       root /var/www/html/YOUR_WEBSITE_DIRECTORY;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to the backend server
       location /api/ {
           proxy_pass https://shribombaychowpati.com/AdminPanel/WebApi/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. Enable the site and restart Nginx:
   ```
   sudo ln -s /etc/nginx/sites-available/YOUR_WEBSITE_NAME /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 3: Deploy Your App

Run the deployment script from your local machine:

```sh
npm run deploy
```

This will:
1. Build your React application
2. Package it into a compressed file
3. Upload it to your Hostinger VPS
4. Extract it to the designated directory
5. Clean up temporary files

### Step 4: Set Up SSL (Optional but Recommended)

For HTTPS support, install Certbot and obtain a certificate:

```sh
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Troubleshooting

If you encounter issues with the deployment:

1. Check SSH access and permissions
2. Verify Nginx configuration
3. Ensure API proxy settings are correct
4. Check for errors in the Nginx logs: `sudo tail -f /var/log/nginx/error.log`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.
