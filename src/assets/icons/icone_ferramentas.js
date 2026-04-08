import React from 'react';
import { Image } from 'react-native';

const IconeFerramentas = ({ style }) => (
  <Image source={require('./icone_ferramentas.png')} style={style} resizeMode="contain" />
);

export default IconeFerramentas;
