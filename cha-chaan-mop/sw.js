// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-82a424fe307f.js');self.addEventListener('install',()=>self.skipWaiting());