// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-515193ee4980.js');self.addEventListener('install',()=>self.skipWaiting());