// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12dc566a58ea.js');self.addEventListener('install',()=>self.skipWaiting());