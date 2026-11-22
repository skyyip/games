// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-35ac2098d687.js');self.addEventListener('install',()=>self.skipWaiting());