// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8160f91d6ada.js');self.addEventListener('install',()=>self.skipWaiting());