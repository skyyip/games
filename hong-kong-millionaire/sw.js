// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c010397eb111.js');self.addEventListener('install',()=>self.skipWaiting());