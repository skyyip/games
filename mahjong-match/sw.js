// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ec2e59cd249f.js');self.addEventListener('install',()=>self.skipWaiting());