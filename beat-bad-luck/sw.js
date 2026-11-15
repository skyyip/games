// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-346dac73d640.js');self.addEventListener('install',()=>self.skipWaiting());