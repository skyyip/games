// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-911520cd38a5.js');self.addEventListener('install',()=>self.skipWaiting());