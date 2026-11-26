// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1acf39456e03.js');self.addEventListener('install',()=>self.skipWaiting());