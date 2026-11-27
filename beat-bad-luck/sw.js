// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b04bfa555dce.js');self.addEventListener('install',()=>self.skipWaiting());