// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e27704e84506.js');self.addEventListener('install',()=>self.skipWaiting());