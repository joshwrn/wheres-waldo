import React, { useState, useEffect } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';
import '../styles/menu.css';
import '../styles/board.css';

import { AiFillCheckCircle } from 'react-icons/ai';
import { FaTimesCircle } from 'react-icons/fa';

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
  const { x, y } = tagLocation;
  const temp = [];
  const [dragItem, setDragItem] = useState('');
  const [correctCheck, setCorrectCheck] = useState('');
  const [gameStatus, setGameStatus] = useState('setup');
  const [playerName, setPlayerName] = useState('');
  const [currentScore, setCurrentScore] = useState(0);

  //+ use server to verify item
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

  //+ get item list once on load
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

  //? game set up functions

  //+ sign user in
  useEffect(() => {
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {})
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  //+ handle start

  const handleStart = (e) => {
    e.preventDefault();
    sendStartTime(e);
    setGameStatus('in-game');
  };

  //+ send starting time
  const sendStartTime = (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    //
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((exists) => {
        if (exists.data().score === undefined) {
          console.log('add');
          firebase
            .firestore()
            .collection('users')
            .doc(user.uid)
            .set({
              name: 'anon',
              score: 0,
              start: firebase.firestore.FieldValue.serverTimestamp(),
              end: '',
            })
            .catch(function (error) {
              console.error('Error writing new message to database', error);
            });
        }
        //
        else {
          // update timestamp
          console.log('sub-collection  existed');
          firebase
            .firestore()
            .collection('users')
            .doc(user.uid)
            .set(
              {
                start: firebase.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            )
            .catch(function (error) {
              console.error('Error writing new message to database', error);
            });
        }
      });
  };

  //? Win functions

  //+ send high score
  const sendScore = async (e, player) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;

    await firebase.firestore().collection('users').doc(user.uid).set(
      {
        name: player,
        end: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const score = await firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .get();

    const highScore =
      Math.max(
        0,
        500 - (score.data().end.seconds - score.data().start.seconds)
      ) * 50;
    setCurrentScore(highScore);
    console.log('data score', score.data().score);
    if (highScore > score.data().score) {
      await firebase.firestore().collection('users').doc(user.uid).set(
        {
          score: highScore,
        },
        { merge: true }
      );
    }
  };

  //+ set end time

  const sendEnd = async () => {
    const user = firebase.auth().currentUser;

    await firebase.firestore().collection('users').doc(user.uid).set(
      {
        end: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  };

  //+ check every item for chosen
  const checkWin = (arr) => {
    return arr.every((item) => item.chosen === true);
  };

  //@ handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendScore(e, playerName);
    setGameStatus('over');
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { value } = e.target;
    setPlayerName(value);
  };

  //+ check for win every item update
  useEffect(() => {
    if (itemsArray.length > 0 && checkWin(itemsArray) === true) {
      setGameStatus('enter-name');
      sendEnd();
    }
  }, [itemsArray]);

  //+ match item locally
  const matchItem = (itemName) => {
    return itemsArray.find((item) => itemName === item.text);
  };

  //+ Test the location of cursor
  async function testLocation(e, itemName) {
    e.preventDefault();
    const chosenItem = matchItem(itemName);
    try {
      const verifyTest = await verifyItem(chosenItem);
      if (verifyTest === true) {
        const itemIndex = itemsArray.findIndex(
          (item) => item.text === chosenItem.text
        );
        setItemsArray((prev) => [...prev], {
          [itemsArray[itemIndex]]: (itemsArray[itemIndex].chosen = true),
        });
        showCorrect('Correct');
      } else {
        showCorrect('Wrong');
      }
    } catch (e) {
      console.log(e);
    }
  }

  //+ show correct or incorrect
  const showCorrect = (result) => {
    setCorrectCheck(result);
    const check = document.getElementById('check');
    check.style.setProperty('opacity', '100');
    check.style.setProperty('visibility', 'visible');
    setTimeout(function () {
      check.style.setProperty('opacity', '0');
    }, 750);
    setTimeout(function () {
      check.style.setProperty('visibility', 'hidden');
    }, 1000);
  };

  //+ handle the drop
  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    testLocation(e, dragItem);
  };

  //+ get the mouse coordinates
  const onDragOver = (e) => {
    e.preventDefault();
    setTagLocation((state) => ({
      ...state,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }));
  };

  //+ store the dragged item in state
  const onDragStart = (e) => {
    setDragItem(e.target.getAttribute('data-text'));
  };

  //! game menu
  let gameMenu;

  if (gameStatus === 'enter-name') {
    gameMenu = (
      <div>
        <form onSubmit={handleSubmit} id="name-form">
          <label>
            Name:
            <input type="text" onChange={handleChange} value={playerName} />
          </label>
          <button type="submit"> Submit </button>
        </form>
      </div>
    );
  }

  if (gameStatus === 'over') {
    gameMenu = (
      <div id="game-over-text">
        <h2>Game Over</h2>
        <p>Your Score: {currentScore}</p>
        <p>High Scores:</p>
        {/* map over high scores */}
      </div>
    );
  }

  if (gameStatus === 'setup') {
    gameMenu = (
      <div id="start-text">
        <h2 onClick={handleStart}>Start Game</h2>
      </div>
    );
  }

  if (gameStatus === 'in-game') {
    gameMenu = null;
  }

  return (
    <div>
      <div id="container">
        <p>hi {playerName}</p>
        <div id="check">
          <div id="check-text">
            {correctCheck === 'Correct' ? (
              <AiFillCheckCircle id="check-mark" />
            ) : (
              <FaTimesCircle id="x-mark" />
            )}
            <p>{correctCheck}</p>
          </div>
        </div>
        <div id="game-menu">{gameMenu}</div>
        <div id="board">
          <div id="sidebar">
            <h2>Find:</h2>
            {itemsArray.map((item) => {
              return (
                <p
                  style={
                    item.chosen === true
                      ? {
                          textDecoration: 'line-through',
                          opacity: '50%',
                          cursor: 'default',
                        }
                      : {
                          cursor: 'pointer',
                        }
                  }
                  key={item.text}
                  draggable={item.chosen === true ? 'false' : 'true'}
                  onDragStart={onDragStart}
                  data-text={item.text}
                >
                  {item.text}
                </p>
              );
            })}
          </div>
          <img
            className="picture"
            src={boardPhoto}
            alt=""
            onDrop={handleDrop}
            onDragOver={onDragOver}
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
