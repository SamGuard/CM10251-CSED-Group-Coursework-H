import React from "react";
import "./Home.css";
import { View, Image } from 'react-native';
import backgroundImg from "../resources/training1.png";

export default function Home() {
  return (
    <div className="Home">
      <div className="lander">
        <h1>Fitness Tracker</h1>
        <p>A simple fitness tracker to keep you fit</p>
        <img src={backgroundImg} alt="Fitness image" style={{flex: 1, aspectRatio: 1.5, resizeMode: 'contain'}} />;
      </div>
    </div>
  );
}