// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f72067eda11a.js');self.addEventListener('install',()=>self.skipWaiting());