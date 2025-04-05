import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Provider, Portal, Dialog, Button } from 'react-native-paper';
import axios from 'axios'

import FooterBar from './components/FooterBar';

export default function More({ navigation }) {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  // Funkcja do wylogowywania
  const handleLogout = async () => {
    try {
      // Wywołanie API do wylogowania
      await axios.post('http://localhost:3000/api/logout', {}, { withCredentials: true })
      .then(response => {
      console.log(response.data);
      })
      .catch(error => {
      console.log('Error logging out:', error);
      });
      hideDialog();
      navigation.replace('LogIn'); // Po wylogowaniu, przenosimy do ekranu LogIn
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.header}>Options</Text>

          <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('AccountSettings')}>
            <Text style={styles.optionText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.optionText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('FAQ')}>
            <Text style={styles.optionText}>FAQ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={showDialog}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Dialog do potwierdzenia wylogowania */}
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Please confirm</Dialog.Title>
            <Dialog.Content>
              <Text style={{color:"#ffffff"}}>Are you sure you want to log out?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={handleLogout}>Log Out</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <FooterBar navigation={navigation} />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 15,
    marginBottom: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
