// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78dc8922271f.js');self.addEventListener('install',()=>self.skipWaiting());