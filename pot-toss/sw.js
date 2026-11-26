// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ae45900b062.js');self.addEventListener('install',()=>self.skipWaiting());