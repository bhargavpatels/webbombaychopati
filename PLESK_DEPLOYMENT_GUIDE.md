# Deploying Ice Cream Express Delivery App to Hostinger VPS using Plesk Panel

## Prerequisites

1. A Hostinger VPS with Plesk Panel access
2. Node.js and npm installed on your local machine
3. Git installed on your local machine
4. Access to your Plesk Panel credentials

## Step 1: Prepare Your Application

1. Build your application locally:
```bash
npm run build
```

2. The build files will be created in the `dist` directory.

## Step 2: Access Plesk Panel

1. Log in to your Hostinger VPS Plesk Panel using your credentials
2. Navigate to the "Websites & Domains" section

## Step 3: Create a New Domain or Subdomain

1. Click "Add Domain" or "Add Subdomain"
2. Enter your domain/subdomain details
3. Configure the following settings:
   - Document Root: Set to your desired directory (e.g., `/var/www/vhosts/yourdomain.com/httpdocs`)
   - PHP Support: Enable if needed
   - SSL/TLS: Enable for secure connections

## Step 4: Upload Your Application

### Method 1: Using Plesk File Manager

1. In Plesk Panel, go to "Websites & Domains" > "File Manager"
2. Navigate to your domain's root directory
3. Upload the contents of your `dist` folder
   - Select all files from your local `dist` directory
   - Upload them to the root directory of your domain

### Method 2: Using FTP/SFTP

1. In Plesk Panel, go to "Websites & Domains" > "FTP Access"
2. Create an FTP account if you don't have one
3. Use an FTP client (like FileZilla) to connect to your server
4. Upload the contents of your `dist` folder to the root directory

## Step 5: Configure Nginx Settings

1. In Plesk Panel, go to "Websites & Domains" > "Hosting Settings"
2. Under "Web Server Settings", select "Nginx"
3. Add the following configuration in the "Additional nginx directives" section:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Proxy API requests if needed
location /api/ {
    proxy_pass https://shribombaychowpati.com/AdminPanel/WebApi/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Step 6: Set Up SSL Certificate

1. In Plesk Panel, go to "Websites & Domains" > "SSL/TLS Certificates"
2. Click "Add SSL/TLS Certificate"
3. Choose one of the following options:
   - Let's Encrypt (free, recommended)
   - Upload your own certificate
4. Follow the prompts to complete the SSL setup

## Step 7: Configure Domain DNS

1. In Plesk Panel, go to "Websites & Domains" > "DNS Settings"
2. Ensure your domain's A record points to your VPS IP address
3. Add any necessary CNAME records for subdomains

## Step 8: Test Your Deployment

1. Visit your domain in a web browser
2. Verify that the application loads correctly
3. Check that all routes work properly
4. Test the API connections if applicable

## Troubleshooting

If you encounter issues:

1. **404 Errors**:
   - Verify that all files are uploaded correctly
   - Check the Nginx configuration
   - Ensure the document root is set correctly

2. **API Connection Issues**:
   - Verify the proxy settings in Nginx
   - Check if the API endpoint is accessible
   - Ensure CORS settings are configured correctly

3. **SSL Issues**:
   - Verify the SSL certificate is properly installed
   - Check if the certificate is valid and not expired
   - Ensure all necessary domains are covered by the certificate

4. **Performance Issues**:
   - Enable gzip compression in Plesk
   - Configure browser caching
   - Optimize your assets

## Maintenance

1. **Regular Updates**:
   - Keep your application dependencies updated
   - Regularly check for security updates
   - Monitor your application's performance

2. **Backups**:
   - Set up regular backups in Plesk
   - Keep a local backup of your source code
   - Document your deployment process

3. **Monitoring**:
   - Use Plesk's monitoring tools
   - Set up error logging
   - Monitor server resources

## Additional Resources

- [Plesk Documentation](https://docs.plesk.com/)
- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [Nginx Configuration Guide](https://nginx.org/en/docs/) 