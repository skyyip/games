// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-14bcddca614d.js');self.addEventListener('install',()=>self.skipWaiting());