// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48ccf53cd848.js');self.addEventListener('install',()=>self.skipWaiting());