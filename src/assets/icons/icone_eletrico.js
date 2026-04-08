import React from 'react';
import { Image } from 'react-native';

const IconeEletrico = ({ style }) => (
  <Image source={require('./icone_eletrico.png')} style={style} resizeMode="contain" />
);

export default IconeEletrico;
