import React, { useState, useEffect } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';
import '../styles/board.css';
import { auth, firestore, timestamp } from '../firebase';
import Menu from './Menu';
import Sidebar from './Sidebar';

import { AiFillCheckCircle } from 'react-icons/ai';
import { FaTimesCircle } from 'react-icons/fa';

const Board = () => {
  const [tagLocation, setTagLocation] = useState({ x: 0, y: 0 });
  const [itemsArray, setItemsArray] = useState([]);
  const [dragItem, setDragItem] = useState('');
  const [correctCheck, setCorrectCheck] = useState('');
  const [gameStatus, setGameStatus] = useState('setup');

  const { x, y } = tagLocation;

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
          return true;
        }
      });
    return results;
  };

  //? game set up functions
  //+ get items from server
  const getItems = () => {
    const temp = [];
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
  };

  //+ get item list once on load
  useEffect(() => {
    getItems();
  }, []);

  //+ sign user in
  useEffect(() => {
    auth
      .signInAnonymously()
      .then(() => {})
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  //? Win functions
  //+ set end time
  const sendEnd = async () => {
    const user = auth.currentUser;
    await firestore.collection('users').doc(user.uid).set(
      {
        end: timestamp,
      },
      { merge: true }
    );
  };

  //+ check every item for chosen
  const checkWin = (arr) => {
    return arr.every((item) => item.chosen === true);
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

  return (
    <div>
      <div id="container">
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
        <Menu
          getItems={getItems}
          gameStatus={gameStatus}
          setGameStatus={setGameStatus}
        />
        <div id="board">
          <Sidebar
            setDragItem={setDragItem}
            itemsArray={itemsArray}
            gameStatus={gameStatus}
          />
          <img
            className="picture"
            src={boardPhoto}
            alt=""
            onDrop={handleDrop}
            onDragOver={onDragOver}
          />
        </div>
      </div>
    </div>
  );
};

export default Board;
