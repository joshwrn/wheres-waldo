import React, { useState, useEffect } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const Mouse = () => {
  const [tagLocation, setTagLocation] = useState({ x: 0, y: 0 });
  const [itemsArray, setItemsArray] = useState([]);
  const { x, y } = tagLocation;
  const temp = [];
  let arrl = '';

  const verifyItem = async (itemName) => {
    await firestore
      .collection('levels')
      .doc('celebration')
      .collection('items')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().text === itemName) {
            console.log('verify true');
            arrl = 'test';
            return true;
          }
        });
      });
  };

  // get item list once on load
  useEffect(() => {
    firestore
      .collection('levels')
      .doc('celebration')
      .collection('items')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          temp.push(doc.data());
        });
        setItemsArray(temp);
      });
  }, []);

  const findItem = itemsArray.find((item) => {
    if (
      x >= item.coordX - 50 &&
      x <= item.coordX + 50 &&
      y >= item.coordY - 50 &&
      y <= item.coordY + 50
    ) {
      return item.text;
    }
  });

  async function testLocation(e) {
    e.preventDefault();
    if (findItem !== undefined) {
      console.log(findItem.text);
      try {
        const verifyTest = await verifyItem(findItem.text);
        console.log(verifyTest);
        console.log(arrl);
        if (arrl === 'test') {
          console.log('please');
          const itemIndex = itemsArray.findIndex(
            (item) => item.text === findItem.text
          );
          setItemsArray(
            (prev) => [...prev],
            {
              [itemsArray[itemIndex]]: (itemsArray[itemIndex].chosen = true),
            },
            console.log(itemsArray)
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log('wrong');
      console.log(itemsArray);
    }
  }

  const onMouseMove = (e) => {
    setTagLocation((state) => ({
      ...state,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }));
  };

  const testFunction = () => {
    console.log(itemsArray);
  };

  return (
    <div>
      <img
        onMouseMove={onMouseMove}
        onClick={testLocation}
        className="picture"
        src={boardPhoto}
        alt=""
      />
      <h1>
        Mouse coordinates: {x} {y}
      </h1>
    </div>
  );
};

export default Mouse;
