// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-769666a907bd.js');self.addEventListener('install',()=>self.skipWaiting());