// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb2156e4224f.js');self.addEventListener('install',()=>self.skipWaiting());