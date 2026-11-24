// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f668280e6db9.js');self.addEventListener('install',()=>self.skipWaiting());