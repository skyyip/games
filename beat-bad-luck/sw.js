// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c55ff3accbe.js');self.addEventListener('install',()=>self.skipWaiting());