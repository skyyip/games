// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ae2165365a4.js');self.addEventListener('install',()=>self.skipWaiting());