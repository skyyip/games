// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b7a59ee56d50.js');self.addEventListener('install',()=>self.skipWaiting());