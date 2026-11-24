// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-332f59247c50.js');self.addEventListener('install',()=>self.skipWaiting());