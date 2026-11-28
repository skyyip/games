// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b37c26975226.js');self.addEventListener('install',()=>self.skipWaiting());