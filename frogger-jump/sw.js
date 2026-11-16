// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6cef0dba5455.js');self.addEventListener('install',()=>self.skipWaiting());