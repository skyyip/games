// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-053548b03e51.js');self.addEventListener('install',()=>self.skipWaiting());