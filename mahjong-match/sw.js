// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8be7ea174508.js');self.addEventListener('install',()=>self.skipWaiting());