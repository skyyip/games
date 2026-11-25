// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6266bc556171.js');self.addEventListener('install',()=>self.skipWaiting());