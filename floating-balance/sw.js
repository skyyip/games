// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6fe38f7ad0f1.js');self.addEventListener('install',()=>self.skipWaiting());