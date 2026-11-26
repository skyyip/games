// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46bcecbf4080.js');self.addEventListener('install',()=>self.skipWaiting());