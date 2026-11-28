// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-071712e574ca.js');self.addEventListener('install',()=>self.skipWaiting());