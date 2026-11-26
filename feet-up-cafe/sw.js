// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-63ba8a56ac15.js');self.addEventListener('install',()=>self.skipWaiting());