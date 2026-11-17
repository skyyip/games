// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b009f32fade9.js');self.addEventListener('install',()=>self.skipWaiting());