const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration for Hostinger VPS
const config = {
  host: '82.112.230.90', // VPS IP address
  domain: 'web.shribombaychowpati.com', // Domain name
  username: 'root', // Replace with your VPS username if different
  remotePath: '/var/www/html/icecream-express', // Website directory
  sshKeyPath: '~/.ssh/id_rsa' // SSH key path
};

// Create .env.production file
const envContent = `
VITE_API_BASE_URL=https://shribombaychowpati.com/AdminPanel/WebApi
VITE_APP_NAME=Ice Cream Express Delivery
VITE_BASE_URL=https://${config.domain}
`;

fs.writeFileSync('.env.production', envContent.trim());

// Build the application
console.log('Building application...');
execSync('npm run build', { stdio: 'inherit' });

// Create deployment package
const distPath = path.join(process.cwd(), 'dist');
const packagePath = path.join(process.cwd(), 'deploy.tar.gz');

console.log('Creating deployment package...');
// Create tar.gz of dist folder
execSync(`tar -czf ${packagePath} -C ${distPath} .`);

console.log('Uploading to VPS...');
// Upload using SCP
execSync(`scp -i ${config.sshKeyPath} ${packagePath} ${config.username}@${config.host}:${config.remotePath}/deploy.tar.gz`);

console.log('Extracting on VPS...');
// SSH into VPS and extract
execSync(`ssh -i ${config.sshKeyPath} ${config.username}@${config.host} "cd ${config.remotePath} && tar -xzf deploy.tar.gz && rm deploy.tar.gz"`);

// Clean up by removing local tar.gz
fs.unlinkSync(packagePath);

console.log('Deployment completed successfully!'); 