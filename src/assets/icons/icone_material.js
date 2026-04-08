import React from 'react';
import { Image } from 'react-native';

const IconeMaterial = ({ style }) => (
  <Image source={require('./icone_material.png')} style={style} resizeMode="contain" />
);

export default IconeMaterial;
