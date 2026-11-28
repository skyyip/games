// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79aaa77bd156.js');self.addEventListener('install',()=>self.skipWaiting());