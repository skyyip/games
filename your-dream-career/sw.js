// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-91d5fb47d75f.js');self.addEventListener('install',()=>self.skipWaiting());