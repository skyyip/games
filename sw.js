// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c5e178ad54ed.js');self.addEventListener('install',()=>self.skipWaiting());