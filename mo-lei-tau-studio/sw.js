// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c8f369a22a2.js');self.addEventListener('install',()=>self.skipWaiting());