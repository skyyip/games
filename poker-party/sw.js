// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18e2d14dddcc.js');self.addEventListener('install',()=>self.skipWaiting());