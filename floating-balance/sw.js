// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5151632ec961.js');self.addEventListener('install',()=>self.skipWaiting());