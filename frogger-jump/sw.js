// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-37aecaa63519.js');self.addEventListener('install',()=>self.skipWaiting());