// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-338d2bb7cef1.js');self.addEventListener('install',()=>self.skipWaiting());