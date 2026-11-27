// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-871ae93dd276.js');self.addEventListener('install',()=>self.skipWaiting());