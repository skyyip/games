// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3314bf094bad.js');self.addEventListener('install',()=>self.skipWaiting());