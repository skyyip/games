// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4dce0cecf27a.js');self.addEventListener('install',()=>self.skipWaiting());