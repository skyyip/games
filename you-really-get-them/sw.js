// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6e9c253ffbbc.js');self.addEventListener('install',()=>self.skipWaiting());