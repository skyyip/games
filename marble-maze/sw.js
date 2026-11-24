// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c292a36be6a.js');self.addEventListener('install',()=>self.skipWaiting());