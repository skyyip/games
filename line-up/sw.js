// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02fe67647e2f.js');self.addEventListener('install',()=>self.skipWaiting());