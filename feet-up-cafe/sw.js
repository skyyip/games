// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6663a56251fa.js');self.addEventListener('install',()=>self.skipWaiting());