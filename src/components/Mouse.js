import React, { useState, useEffect } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';
import '../styles/menu.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  });
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

const Mouse = () => {
  const [tagLocation, setTagLocation] = useState({ x: 0, y: 0 });
  const [itemsArray, setItemsArray] = useState([]);
  const [contextMenu, setContextMenu] = useState({ display: 'none' });
  const { x, y } = tagLocation;
  const temp = [];

  const verifyItem = async (item) => {
    const results = await firestore
      .collection('levels')
      .doc('celebration')
      .collection('items')
      .doc(item.text)
      .get()
      .then((doc) => {
        if (
          doc.data().coordX >= item.coordX - 50 &&
          doc.data().coordX <= item.coordX + 50 &&
          doc.data().coordY >= item.coordY - 50 &&
          doc.data().coordY <= item.coordY + 50
        ) {
          console.log('Document data:', doc.data());
          return true;
        }
      });
    return results;
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

  async function testLocation(e, itemName) {
    e.preventDefault();
    if (findItem !== undefined && findItem.chosen !== true) {
      console.log(findItem.text);
      try {
        const verifyTest = await verifyItem(findItem);
        console.log(verifyTest);
        if (verifyTest === true) {
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

  const handleClick = (e) => {
    e.preventDefault();
    setContextMenu((state) => ({
      ...state,
      display: 'block',
    }));
  };

  const handleSelection = (e) => {
    e.preventDefault();
    const itemName = e.target.getAttribute('data-text');
    testLocation(e, itemName);
    setContextMenu((state) => ({
      ...state,
      display: 'none',
    }));
  };

  return (
    <div>
      <div
        id="menu"
        style={{
          top: y,
          left: x,
          display: contextMenu.display,
        }}
      >
        {itemsArray.map((item) => {
          return (
            <p
              style={
                item.chosen === true
                  ? {
                      textDecoration: 'line-through',
                    }
                  : null
              }
              key={item.text}
              data-text={item.text}
              onClick={item.chosen !== true ? handleSelection : null}
            >
              {item.text}
            </p>
          );
        })}
      </div>
      <img
        onMouseMove={contextMenu.display === 'none' ? onMouseMove : null}
        onClick={handleClick}
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
