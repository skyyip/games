// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0983051d0723.js');self.addEventListener('install',()=>self.skipWaiting());