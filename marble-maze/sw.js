// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-478794ec6dff.js');self.addEventListener('install',()=>self.skipWaiting());