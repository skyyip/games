// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-295848905a3c.js');self.addEventListener('install',()=>self.skipWaiting());