import React, { useState } from 'react';
import { auth, firestore, timestamp } from '../firebase';
import { FaRedoAlt } from 'react-icons/fa';
import '../styles/menu.css';

const Menu = ({ getItems, gameStatus, setGameStatus }) => {
  const [playerName, setPlayerName] = useState('');
  const [currentScore, setCurrentScore] = useState(0);
  const [highScores, setHighScores] = useState([]);

  //? send starting time
  const sendStartTime = (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    firestore
      .collection('users')
      .doc(user.uid)
      .get()
      .then((userData) => {
        if (!userData.exists) {
          console.log('add');
          firestore
            .collection('users')
            .doc(user.uid)
            .set({
              name: 'anon',
              score: 0,
              start: timestamp,
              end: '',
            })
            .catch(function (error) {
              console.error('Error writing new message to database', error);
            });
        } else {
          // update timestamp
          console.log('sub-collection  existed');
          firestore
            .collection('users')
            .doc(user.uid)
            .set(
              {
                start: timestamp,
              },
              { merge: true }
            )
            .catch(function (error) {
              console.error('Error writing new message to database', error);
            });
        }
      });
  };

  //? handle start
  const handleStart = (e) => {
    e.preventDefault();
    sendStartTime(e);
    setGameStatus('in-game');
  };

  //? send high score
  const sendScore = async (e, player) => {
    e.preventDefault();
    const user = auth.currentUser;

    await firestore.collection('users').doc(user.uid).set(
      {
        name: player,
        end: timestamp,
      },
      { merge: true }
    );

    const score = await firestore.collection('users').doc(user.uid).get();

    const highScore =
      Math.max(
        0,
        500 - (score.data().end.seconds - score.data().start.seconds)
      ) * 50;
    setCurrentScore(highScore);
    console.log('data score', score.data().score);
    if (highScore > score.data().score) {
      await firestore.collection('users').doc(user.uid).set(
        {
          score: highScore,
        },
        { merge: true }
      );
    }
  };

  //? handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendScore(e, playerName);
    setGameStatus('over');
    // get high scores
    const tempScores = [];
    firestore
      .collection('users')
      .where('score', '!=', 0)
      .orderBy('score', 'desc')
      .limit(5)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          tempScores.push(doc.data());
        });
        setHighScores(tempScores);
      });
  };

  //? handle name change
  const handleChange = (e) => {
    e.preventDefault();
    const { value } = e.target;
    setPlayerName(value);
  };

  //? handle restart

  const handleRestart = (e) => {
    e.preventDefault();
    getItems();
    setGameStatus('setup');
  };

  //! game menu
  let gameMenu;

  if (gameStatus === 'enter-name') {
    gameMenu = (
      <div>
        <form onSubmit={handleSubmit} id="name-form">
          <p>Name:</p>
          <input
            id="name-input"
            type="text"
            onChange={handleChange}
            value={playerName}
          />
          <button id="submit-button" type="submit">
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (gameStatus === 'over') {
    gameMenu = (
      <div id="game-over-text">
        <h2 id="game-over-header">Game Over</h2>
        <p id="your-score-text">Your Score - {currentScore}</p>
        <h3>Top Scores:</h3>
        {highScores.map((score) => (
          <p className="score-text" key={score.name + score.score}>
            {score.name} - {score.score}
          </p>
        ))}
        <FaRedoAlt id="redo-button" onClick={handleRestart} />
      </div>
    );
  }

  if (gameStatus === 'setup') {
    gameMenu = (
      <div onClick={handleStart} id="start-text">
        <h2>Start Game</h2>
        <p id="instructions">Drag & Drop Items From the Sidebar</p>
      </div>
    );
  }

  if (gameStatus === 'in-game') {
    gameMenu = null;
  }

  return <div id="game-menu">{gameMenu}</div>;
};

export default Menu;
