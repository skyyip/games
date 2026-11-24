// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-245ceb4f7977.js');self.addEventListener('install',()=>self.skipWaiting());