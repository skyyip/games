// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0dac58937eec.js');self.addEventListener('install',()=>self.skipWaiting());