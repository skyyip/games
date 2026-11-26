// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ea125a714ec2.js');self.addEventListener('install',()=>self.skipWaiting());