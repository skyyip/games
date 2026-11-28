// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-653619dda6a1.js');self.addEventListener('install',()=>self.skipWaiting());