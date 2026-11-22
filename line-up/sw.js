// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37bddeacd000.js');self.addEventListener('install',()=>self.skipWaiting());