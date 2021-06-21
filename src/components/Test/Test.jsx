import React from 'react';

import { FirebaseContext } from '../Firebase';

function SomeComponent() {
  return (
    <FirebaseContext.Consumer>
      {(firebase) => {
        const handleClick = () => {
          firebase.sendContent('hi');
        };
        return (
          <div onClick={handleClick}>
            I've access to Firebase and render something.
          </div>
        );
      }}
    </FirebaseContext.Consumer>
  );
}

export default SomeComponent;
