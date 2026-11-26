// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd74852f809b.js');self.addEventListener('install',()=>self.skipWaiting());