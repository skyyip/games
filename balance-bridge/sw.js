// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f3b6bec0432.js');self.addEventListener('install',()=>self.skipWaiting());