// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-af05913b4025.js');self.addEventListener('install',()=>self.skipWaiting());