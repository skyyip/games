// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-35016141b6ae.js');self.addEventListener('install',()=>self.skipWaiting());