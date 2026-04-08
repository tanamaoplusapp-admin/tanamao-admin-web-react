import React from 'react';
import { Image } from 'react-native';

const IconeEmpresa = ({ style }) => (
  <Image source={require('./icone_empresa.png')} style={style} resizeMode="contain" />
);

export default IconeEmpresa;
