// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12cf86c93276.js');self.addEventListener('install',()=>self.skipWaiting());