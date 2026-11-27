// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ab5bf2f60c15.js');self.addEventListener('install',()=>self.skipWaiting());