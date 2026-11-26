// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8ba3059830f1.js');self.addEventListener('install',()=>self.skipWaiting());