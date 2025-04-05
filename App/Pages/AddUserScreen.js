import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function AddUserScreen({ route, navigation }) {
  const { groupId } = route.params;  // Przekazanie groupId przez params
  const [userName, setUserName] = useState(''); // Przechowywanie nazwy użytkownika
  const [errorMessage, setErrorMessage] = useState('');  // Przechowywanie błędu

  const handleAddUser = async () => {
    if (userName.trim()) {
      try {
        // Wysyłanie żądania do backendu, aby znaleźć użytkownika i dodać go do grupy
        const response = await axios.post('http://localhost:3000/api/addUserToGroup', {
          groupId: groupId,  // ID grupy
          userName: userName.trim(),  // Nazwa użytkownika
        });

        if (response.status === 200) {
          Alert.alert('Success', 'User added to group successfully!');
          navigation.goBack();  // Powrót do poprzedniego ekranu
        } else {
          setErrorMessage('Failed to add user. Please try again.');
        }
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.error || 'Failed to add user to group.');
        } else {
          setErrorMessage('Connection error. Please try again later.');
        }
      }
    } else {
      setErrorMessage('Please enter a valid user name.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter user name"
        value={userName}
        onChangeText={(text) => {
          setUserName(text);
          setErrorMessage(null); // Reset błędu przy edycji
        }}
        placeholderTextColor="#8e8e8e"
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  input: {
    backgroundColor: '#2c2c2c',
    color: '#fff',
    padding: 10,
    borderRadius: 15,
    width: '80%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 15,
    textAlign: 'center',
  },
});
