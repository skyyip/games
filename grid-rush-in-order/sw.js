// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a80522eac1f.js');self.addEventListener('install',()=>self.skipWaiting());