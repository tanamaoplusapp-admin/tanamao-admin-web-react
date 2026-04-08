// assets/icons/icone_ajuda.js
import React from 'react';
import { Image } from 'react-native';

const IconeAjuda = ({ style }) => (
  <Image
    source={require('./icone_ajuda.png')}
    style={style}
    resizeMode="contain"
  />
);

export default IconeAjuda;
