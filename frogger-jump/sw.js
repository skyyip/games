// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b577ffbde96.js');self.addEventListener('install',()=>self.skipWaiting());