// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-606b1dc350bf.js');self.addEventListener('install',()=>self.skipWaiting());