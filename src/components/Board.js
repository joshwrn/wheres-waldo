import React from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyADxCQy9_A6MbGEvROV64IHMifVZaec5hQ',
  authDomain: 'waldo-37e04.firebaseapp.com',
  projectId: 'waldo-37e04',
  storageBucket: 'waldo-37e04.appspot.com',
  messagingSenderId: '856550100154',
  appId: '1:856550100154:web:13b82c490bac63e55fc683',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      </main>
    </>
  );
}

function ChatMessage(props) {
  const { text } = props.message;
  return (
    <>
      <p>{text}</p>
    </>
  );
}

const Board = () => {
  return (
    <div>
      <ChatRoom />
    </div>
  );
};

export default Board;
