// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-094009ff3645.js');self.addEventListener('install',()=>self.skipWaiting());