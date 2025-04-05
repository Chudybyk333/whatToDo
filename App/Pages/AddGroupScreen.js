import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';  // Dodajemy axios do komunikacji z API

export default function AddGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');

  // Funkcja do obsługi dodawania grupy
  const handleAddGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name!');
      return;
    }

    const newGroup = {
      groupName,
    };

    try {
      // Wyślij zapytanie POST do backendu, aby dodać grupę
      const response = await axios.post('http://localhost:3000/api/add-group', newGroup, { withCredentials: true });

      // Jeśli grupa została dodana pomyślnie, wracamy do poprzedniego ekranu
      if (response.status === 201) {
        alert('Group added successfully!');
        setGroupName('');  // Resetowanie formularza
        navigation.goBack();  // Wróć do poprzedniego ekranu
      }
    } catch (error) {
      console.error('Error adding group: ', error);
      alert('Failed to add group. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add a New Group</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        placeholderTextColor="#aaa"
        value={groupName}
        onChangeText={setGroupName}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddGroup}>
        <Text style={styles.buttonText}>Add Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
