// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-995132db8c8a.js');self.addEventListener('install',()=>self.skipWaiting());