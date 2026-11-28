// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-050e088e6272.js');self.addEventListener('install',()=>self.skipWaiting());