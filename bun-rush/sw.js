// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-026013527d4f.js');self.addEventListener('install',()=>self.skipWaiting());