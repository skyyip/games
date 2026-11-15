// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-86697b41bfdf.js');self.addEventListener('install',()=>self.skipWaiting());