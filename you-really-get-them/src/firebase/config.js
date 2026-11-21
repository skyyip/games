// Firebase Web App configuration. These browser keys identify the app; Firestore Rules protect data access.
export const firebaseConfig = {
  apiKey: 'AIzaSyC_M7ywcmu4MRJ89ZSI758j1L3tv4CDxUI',
  authDomain: 'you-really-get-them.firebaseapp.com',
  projectId: 'you-really-get-them',
  storageBucket: 'you-really-get-them.firebasestorage.app',
  messagingSenderId: '494212767846',
  appId: '1:494212767846:web:a245b0c325f84fe1580da7'
};
export const firebaseReady = ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => !firebaseConfig[key].startsWith('YOUR_'));
