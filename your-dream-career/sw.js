// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ea53f8d74fe.js');self.addEventListener('install',()=>self.skipWaiting());