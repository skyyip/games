// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-294103297e9f.js');self.addEventListener('install',()=>self.skipWaiting());