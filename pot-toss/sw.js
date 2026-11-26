// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7becc31ff172.js');self.addEventListener('install',()=>self.skipWaiting());