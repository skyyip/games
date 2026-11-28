// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-731c7b9a59f3.js');self.addEventListener('install',()=>self.skipWaiting());