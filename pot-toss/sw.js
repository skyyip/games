// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-954847ff63d4.js');self.addEventListener('install',()=>self.skipWaiting());