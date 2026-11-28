// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8694d590388a.js');self.addEventListener('install',()=>self.skipWaiting());