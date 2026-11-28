// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69079df3246b.js');self.addEventListener('install',()=>self.skipWaiting());