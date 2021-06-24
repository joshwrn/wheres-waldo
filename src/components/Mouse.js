import React, { useState } from 'react';
import boardPhoto from '../assets/img/picture.jpg';
import '../styles/photo.css';

const Mouse = () => {
  const [tagLocation, setTagLocation] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    setTagLocation((state) => ({
      ...state,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }));
  };

  const { x, y } = tagLocation;

  return (
    <div onMouseMove={onMouseMove}>
      <img className="picture" src={boardPhoto} alt="" />
      <h1>
        Mouse coordinates: {x} {y}
      </h1>
    </div>
  );
};

export default Mouse;
