// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-326b477dd9b9.js');self.addEventListener('install',()=>self.skipWaiting());