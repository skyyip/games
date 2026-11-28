// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f93159168df4.js');self.addEventListener('install',()=>self.skipWaiting());