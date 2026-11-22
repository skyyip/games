// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6982d026e245.js');self.addEventListener('install',()=>self.skipWaiting());