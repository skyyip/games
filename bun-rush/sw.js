// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18060863ff52.js');self.addEventListener('install',()=>self.skipWaiting());