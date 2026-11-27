// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2d071ccba768.js');self.addEventListener('install',()=>self.skipWaiting());