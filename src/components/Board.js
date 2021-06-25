import React, { useState, useEffect } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';
import '../styles/menu.css';
import '../styles/board.css';

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

const Board = () => {
  const [tagLocation, setTagLocation] = useState({ x: 0, y: 0 });
  const [itemsArray, setItemsArray] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    display: 'none',
    x: 0,
    y: 0,
  });
  const { x, y } = tagLocation;
  const temp = [];

  const verifyItem = (item) => {
    const results = firestore
      .collection('levels')
      .doc('celebration')
      .collection('items')
      .doc(item.text)
      .get()
      .then((doc) => {
        if (
          x >= doc.data().coordX - 50 &&
          x <= doc.data().coordX + 50 &&
          y >= doc.data().coordY - 50 &&
          y <= doc.data().coordY + 50
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

  const matchItem = (itemName) => {
    return itemsArray.find((item) => itemName === item.text);
  };

  async function testLocation(e, itemName) {
    e.preventDefault();
    const chosenItem = matchItem(itemName);

    try {
      const verifyTest = await verifyItem(chosenItem);
      console.log('test', verifyTest);
      if (verifyTest === true) {
        console.log('correct');
        const itemIndex = itemsArray.findIndex(
          (item) => item.text === chosenItem.text
        );
        setItemsArray(
          (prev) => [...prev],
          {
            [itemsArray[itemIndex]]: (itemsArray[itemIndex].chosen = true),
          },
          console.log(itemsArray)
        );
      } else {
        console.log('wrong');
        console.log(itemsArray);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const onMouseMove = (e) => {
    setTagLocation((state) => ({
      ...state,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }));
    setContextMenu((state) => ({
      ...state,
      x: e.clientX,
      y: e.clientY,
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

  const handleClose = (e) => {
    e.preventDefault();
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
          top: contextMenu.y,
          left: contextMenu.x,
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
                      opacity: '50%',
                      display: 'none',
                    }
                  : {
                      cursor: 'pointer',
                    }
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
      <div id="container">
        <div id="board">
          <div id="sidebar">
            <h3>Find:</h3>
            {itemsArray.map((item) => {
              return (
                <p
                  style={
                    item.chosen === true
                      ? {
                          textDecoration: 'line-through',
                          opacity: '50%',
                        }
                      : null
                  }
                  key={item.text}
                >
                  {item.text}
                </p>
              );
            })}
          </div>
          <img
            className="picture"
            onMouseMove={contextMenu.display === 'none' ? onMouseMove : null}
            onClick={contextMenu.display === 'none' ? handleClick : handleClose}
            src={boardPhoto}
            alt=""
          />
          <p style={{ position: 'absolute', bottom: 0 }}>
            {x} {y}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Board;
