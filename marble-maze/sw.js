// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-469716466efe.js');self.addEventListener('install',()=>self.skipWaiting());