import React from 'react';
import { Image } from 'react-native';

const IconeFerragens = ({ style }) => (
  <Image source={require('./icone_ferragens.png')} style={style} resizeMode="contain" />
);

export default IconeFerragens;
