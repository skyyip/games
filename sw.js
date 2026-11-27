// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-05ff82008a68.js');self.addEventListener('install',()=>self.skipWaiting());