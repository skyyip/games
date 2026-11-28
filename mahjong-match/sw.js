// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3db1c8a44dbc.js');self.addEventListener('install',()=>self.skipWaiting());