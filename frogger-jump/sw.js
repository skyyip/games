// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f67263dc0ff.js');self.addEventListener('install',()=>self.skipWaiting());