// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-591d7da15ed9.js');self.addEventListener('install',()=>self.skipWaiting());