// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f33ba31bf0f.js');self.addEventListener('install',()=>self.skipWaiting());