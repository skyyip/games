// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ff441d7ba05f.js');self.addEventListener('install',()=>self.skipWaiting());