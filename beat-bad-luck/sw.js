// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0471607dcd95.js');self.addEventListener('install',()=>self.skipWaiting());