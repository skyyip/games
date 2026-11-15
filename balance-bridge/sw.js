// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-85e5effb5447.js');self.addEventListener('install',()=>self.skipWaiting());