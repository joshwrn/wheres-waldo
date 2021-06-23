import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
  apiKey: 'AIzaSyADxCQy9_A6MbGEvROV64IHMifVZaec5hQ',
  authDomain: 'waldo-37e04.firebaseapp.com',
  projectId: 'waldo-37e04',
  storageBucket: 'waldo-37e04.appspot.com',
  messagingSenderId: '856550100154',
  appId: '1:856550100154:web:13b82c490bac63e55fc683',
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export const sendContent = (content) => {
  // Add a new message entry to the database.
  return db
    .firestore()
    .collection('messages')
    .add({
      text: content,
    })
    .catch(function (error) {
      console.error('Error writing new message to database', error);
    });
};
