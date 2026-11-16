// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4995e1ade302.js');self.addEventListener('install',()=>self.skipWaiting());