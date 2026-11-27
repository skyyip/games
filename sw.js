// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d551c45ad0b.js');self.addEventListener('install',()=>self.skipWaiting());