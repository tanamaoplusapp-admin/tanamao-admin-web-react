import React from 'react';
import { Image } from 'react-native';

const IconePedido = ({ style }) => (
  <Image source={require('./icone_pedido.png')} style={style} resizeMode="contain" />
);

export default IconePedido;
