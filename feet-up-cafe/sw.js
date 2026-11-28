// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38c3f3715b29.js');self.addEventListener('install',()=>self.skipWaiting());