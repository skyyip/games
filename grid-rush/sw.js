// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8410d615251a.js');self.addEventListener('install',()=>self.skipWaiting());