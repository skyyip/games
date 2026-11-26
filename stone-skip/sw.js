// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e7b082c90de2.js');self.addEventListener('install',()=>self.skipWaiting());