// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53d6aeb8a4c8.js');self.addEventListener('install',()=>self.skipWaiting());