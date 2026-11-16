// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-831d73ca9e1f.js');self.addEventListener('install',()=>self.skipWaiting());