// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd9013558f04.js');self.addEventListener('install',()=>self.skipWaiting());