// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9738a874461a.js');self.addEventListener('install',()=>self.skipWaiting());