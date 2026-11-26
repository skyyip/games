// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02eadb580267.js');self.addEventListener('install',()=>self.skipWaiting());