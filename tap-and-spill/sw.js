// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed8805379c27.js');self.addEventListener('install',()=>self.skipWaiting());