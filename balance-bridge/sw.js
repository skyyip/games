// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-417e40710434.js');self.addEventListener('install',()=>self.skipWaiting());