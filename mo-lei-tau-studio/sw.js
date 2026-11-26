// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2802fcf1ebba.js');self.addEventListener('install',()=>self.skipWaiting());