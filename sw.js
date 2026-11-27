// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-20984b7b059e.js');self.addEventListener('install',()=>self.skipWaiting());