// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-67dccd3bbafc.js');self.addEventListener('install',()=>self.skipWaiting());