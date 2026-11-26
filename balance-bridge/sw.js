// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ce914fff31ee.js');self.addEventListener('install',()=>self.skipWaiting());