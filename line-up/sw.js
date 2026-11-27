// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8182c3ae79b4.js');self.addEventListener('install',()=>self.skipWaiting());