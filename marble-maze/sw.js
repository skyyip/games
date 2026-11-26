// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fdeb236b0dcf.js');self.addEventListener('install',()=>self.skipWaiting());