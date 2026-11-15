// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d3467ffea91.js');self.addEventListener('install',()=>self.skipWaiting());