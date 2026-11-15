// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5ce7f04eda4f.js');self.addEventListener('install',()=>self.skipWaiting());