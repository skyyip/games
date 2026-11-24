// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37fc6e4aaa84.js');self.addEventListener('install',()=>self.skipWaiting());