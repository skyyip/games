// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ee159d986cb.js');self.addEventListener('install',()=>self.skipWaiting());