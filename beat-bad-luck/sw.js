// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-022fbd3f258b.js');self.addEventListener('install',()=>self.skipWaiting());