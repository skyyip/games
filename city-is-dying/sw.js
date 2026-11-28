// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-13457e111c20.js');self.addEventListener('install',()=>self.skipWaiting());