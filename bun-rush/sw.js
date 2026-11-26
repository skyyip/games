// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5ea4bb3ca6dd.js');self.addEventListener('install',()=>self.skipWaiting());