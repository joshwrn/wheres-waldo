import React from 'react';
import '../styles/sidebar.css';

const Sidebar = ({ setDragItem, itemsArray, gameStatus }) => {
  //+ store the dragged item in state
  const onDragStart = (e) => {
    setDragItem(e.target.getAttribute('data-text'));
  };
  return (
    <div id="sidebar">
      <h2>Find:</h2>
      {itemsArray.map((item) => {
        return (
          <p
            style={
              item.chosen !== true && gameStatus === 'in-game'
                ? {
                    cursor: 'pointer',
                  }
                : {
                    textDecoration: 'line-through',
                    opacity: '50%',
                    cursor: 'default',
                    display: 'none',
                  }
            }
            key={item.text}
            draggable={
              item.chosen !== true && gameStatus === 'in-game'
                ? 'true'
                : 'false'
            }
            onDragStart={onDragStart}
            data-text={item.text}
          >
            {item.text}
          </p>
        );
      })}
    </div>
  );
};

export default Sidebar;
