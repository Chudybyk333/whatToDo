import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Provider, Portal, Dialog, Button } from 'react-native-paper';
import axios from 'axios';

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = (message) => {
    setDialogMessage(message);
    setIsDialogVisible(true);
  };

  const hideDialog = () => setIsDialogVisible(false);

  const handleRegister = async () => {
    // Sprawdź, czy hasła się zgadzają
    if (password !== confirmPassword) {
      showDialog('Passwords do not match!');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/api/register', {
        email,
        password,
        username
      });
  
      // Rejestracja zakończona sukcesem
      if (response.status === 201) {
        showDialog('Account created successfully!');
        
        setTimeout(() => {
          hideDialog();
          navigation.replace('Tasks'); // Przekierowanie do ekranu "Tasks"
        }, 1000);
      } else {
        // Obsłuż niespodziewane odpowiedzi
        const errorMessage = response.data.error || 'Failed to create account.';
        showDialog(errorMessage);
      }
    } catch (error) {
      console.error('Error during registration:', error);
  
      if (error.response) {
        // Obsługa odpowiedzi z backendu
        const { data } = error.response;
        if (data.errors && Array.isArray(data.errors)) {
          // Jeśli backend zwraca tablicę błędów walidacji
          const errorMessages = data.errors.map(err => `${err.param}: ${err.msg}`).join('\n');
          showDialog(errorMessages);
        } else if (data.error) {
          // Jeśli backend zwraca pojedynczy błąd
          showDialog(data.error);
        } else {
          // Ogólny błąd
          showDialog('An error occurred. Please try again.');
        }
      } else {
        // Błąd sieciowy lub brak odpowiedzi
        showDialog('Failed to connect to the server. Please try again.');
      }
    }
  };
  

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Create an Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Dialog */}
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Notification</Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: '#ffffff' }}>{dialogMessage}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#3A316F',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 15,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
