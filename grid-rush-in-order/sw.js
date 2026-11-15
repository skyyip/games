// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15832bcf4123.js');self.addEventListener('install',()=>self.skipWaiting());