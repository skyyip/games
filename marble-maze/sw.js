// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fb7667b3e6fb.js');self.addEventListener('install',()=>self.skipWaiting());