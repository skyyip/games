// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3031d1f93b4e.js');self.addEventListener('install',()=>self.skipWaiting());