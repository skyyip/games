// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-63e69f6adc17.js');self.addEventListener('install',()=>self.skipWaiting());