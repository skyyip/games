// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-653098f44512.js');self.addEventListener('install',()=>self.skipWaiting());