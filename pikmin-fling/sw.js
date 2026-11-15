// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-35b9379ea06f.js');self.addEventListener('install',()=>self.skipWaiting());