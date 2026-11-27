// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6589946e801f.js');self.addEventListener('install',()=>self.skipWaiting());