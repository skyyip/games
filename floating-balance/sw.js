// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c207198dc992.js');self.addEventListener('install',()=>self.skipWaiting());