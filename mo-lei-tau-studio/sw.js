// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b7dc735356fa.js');self.addEventListener('install',()=>self.skipWaiting());