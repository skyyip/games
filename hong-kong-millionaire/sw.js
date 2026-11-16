// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ff834ea748f5.js');self.addEventListener('install',()=>self.skipWaiting());