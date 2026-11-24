// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed108a145b8e.js');self.addEventListener('install',()=>self.skipWaiting());