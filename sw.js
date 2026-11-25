// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8cac43371881.js');self.addEventListener('install',()=>self.skipWaiting());