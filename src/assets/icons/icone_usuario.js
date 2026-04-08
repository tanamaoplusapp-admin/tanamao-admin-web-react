import React from 'react';
import { Image } from 'react-native';

const IconeUsuario = ({ style }) => (
  <Image source={require('./icone_usuario.png')} style={style} resizeMode="contain" />
);

export default IconeUsuario;
