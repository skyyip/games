// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-829b9129163f.js');self.addEventListener('install',()=>self.skipWaiting());