// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-52261161e089.js');self.addEventListener('install',()=>self.skipWaiting());