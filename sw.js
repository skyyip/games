// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ba66cbca317.js');self.addEventListener('install',()=>self.skipWaiting());