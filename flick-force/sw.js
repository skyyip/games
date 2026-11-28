// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51ce95148488.js');self.addEventListener('install',()=>self.skipWaiting());