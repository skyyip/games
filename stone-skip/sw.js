// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0517ecaa622a.js');self.addEventListener('install',()=>self.skipWaiting());