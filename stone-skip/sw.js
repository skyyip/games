// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0aaf5dd6b788.js');self.addEventListener('install',()=>self.skipWaiting());