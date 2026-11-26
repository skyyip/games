// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53a43469e3d6.js');self.addEventListener('install',()=>self.skipWaiting());