// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-27edcfc0f0f2.js');self.addEventListener('install',()=>self.skipWaiting());