import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

const IconeHidraulico = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('./icone_hidraulico.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: 80, // ajuste conforme o necessário
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});

export default IconeHidraulico;
