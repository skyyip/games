// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80935055e543.js');self.addEventListener('install',()=>self.skipWaiting());