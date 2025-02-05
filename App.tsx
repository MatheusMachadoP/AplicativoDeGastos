import React from 'react';
import { StatusBar } from 'react-native';
import Navegacao from './navegacao';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Navegacao />
    </>
  );
};

export default App;
