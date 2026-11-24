// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-169316a53960.js');self.addEventListener('install',()=>self.skipWaiting());