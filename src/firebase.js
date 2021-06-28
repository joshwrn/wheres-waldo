import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const db = () => {
  if (!firebase.apps.length) {
    return firebase.initializeApp({
      apiKey: 'AIzaSyADxCQy9_A6MbGEvROV64IHMifVZaec5hQ',
      authDomain: 'waldo-37e04.firebaseapp.com',
      projectId: 'waldo-37e04',
      storageBucket: 'waldo-37e04.appspot.com',
      messagingSenderId: '856550100154',
      appId: '856550100154:web:13b82c490bac63e55fc683',
    });
  } else {
    return firebase.app(); // if already initialized, use that one
  }
};

db();

export const app = firebase;
export const timestamp = firebase.firestore.FieldValue.serverTimestamp();
export const auth = firebase.auth();
export const firestore = firebase.firestore();
