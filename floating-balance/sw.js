// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-50966a5147a5.js');self.addEventListener('install',()=>self.skipWaiting());