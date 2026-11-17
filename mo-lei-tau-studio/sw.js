// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-581463f940c7.js');self.addEventListener('install',()=>self.skipWaiting());