// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93b06241af23.js');self.addEventListener('install',()=>self.skipWaiting());