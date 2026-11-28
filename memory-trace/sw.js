// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-872d7ecb959b.js');self.addEventListener('install',()=>self.skipWaiting());