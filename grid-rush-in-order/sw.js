// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-932a4e6bbe38.js');self.addEventListener('install',()=>self.skipWaiting());