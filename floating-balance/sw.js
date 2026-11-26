// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-721822bec4e5.js');self.addEventListener('install',()=>self.skipWaiting());