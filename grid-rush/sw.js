// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1f32489b6dcc.js');self.addEventListener('install',()=>self.skipWaiting());