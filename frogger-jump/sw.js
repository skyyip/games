// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed179fc30612.js');self.addEventListener('install',()=>self.skipWaiting());