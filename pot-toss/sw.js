// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8e47d0db723b.js');self.addEventListener('install',()=>self.skipWaiting());