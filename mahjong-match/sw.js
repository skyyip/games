// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3349cad4c3fc.js');self.addEventListener('install',()=>self.skipWaiting());