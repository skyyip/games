// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe68e712d865.js');self.addEventListener('install',()=>self.skipWaiting());