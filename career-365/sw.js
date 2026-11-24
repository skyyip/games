// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5eadb22029fd.js');self.addEventListener('install',()=>self.skipWaiting());