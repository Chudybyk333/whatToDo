import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Start({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.appName}>What To Do...</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('LogIn')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#6C63FF',
    marginBottom: 10,
    fontWeight: '600',
  },
  appName: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttons: {
    marginTop: 60,
    width: 300,
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    shadowColor: '#3A316F',
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});