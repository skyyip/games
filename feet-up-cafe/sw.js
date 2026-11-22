// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-70f941fd0645.js');self.addEventListener('install',()=>self.skipWaiting());