// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ac9b7397be4.js');self.addEventListener('install',()=>self.skipWaiting());