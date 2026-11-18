// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-94d589d0ce46.js');self.addEventListener('install',()=>self.skipWaiting());