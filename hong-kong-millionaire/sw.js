// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f085f284d6de.js');self.addEventListener('install',()=>self.skipWaiting());