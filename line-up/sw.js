// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-338920a58413.js');self.addEventListener('install',()=>self.skipWaiting());