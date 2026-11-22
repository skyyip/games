// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3883996d277f.js');self.addEventListener('install',()=>self.skipWaiting());