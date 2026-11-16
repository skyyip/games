// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8ffc39109c62.js');self.addEventListener('install',()=>self.skipWaiting());