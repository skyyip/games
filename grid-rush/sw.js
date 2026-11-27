// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-32258b41b549.js');self.addEventListener('install',()=>self.skipWaiting());