// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89a4706abdec.js');self.addEventListener('install',()=>self.skipWaiting());