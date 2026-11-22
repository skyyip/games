// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee51d602ac29.js');self.addEventListener('install',()=>self.skipWaiting());