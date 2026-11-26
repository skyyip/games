// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-94e909e82679.js');self.addEventListener('install',()=>self.skipWaiting());