// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46b89a9e8f1f.js');self.addEventListener('install',()=>self.skipWaiting());