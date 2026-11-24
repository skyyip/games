// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ddd08be116d.js');self.addEventListener('install',()=>self.skipWaiting());