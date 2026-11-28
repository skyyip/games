// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1de93d795516.js');self.addEventListener('install',()=>self.skipWaiting());