import React from 'react';
import { Image } from 'react-native';

const IconeMotorista = ({ style }) => (
  <Image source={require('./icone_motorista.png')} style={style} resizeMode="contain" />
);

export default IconeMotorista;
