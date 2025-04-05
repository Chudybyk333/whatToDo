import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Provider, Portal, Dialog, Button } from 'react-native-paper';
import axios from 'axios';

export default function LogIn({ navigation }) {
  const [login, setLogin] = useState(''); // Obsługuje zarówno email, jak i username
  const [password, setPassword] = useState('');  
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = (message) => {
    setDialogMessage(message);
    setIsDialogVisible(true);
  };

  const hideDialog = () => setIsDialogVisible(false);

  const handleLogin = async () => {
    if (!login || !password) {
        showDialog('Please fill in both fields.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/login', {
            email: login,
            password,
        });

        if (response.status === 200) {
            // Przejdź do ekranu 'Tasks' bez wyświetlania komunikatu sukcesu
            navigation.replace('Tasks');
        } else {
            showDialog(response.data.error || 'Failed to log in.');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
            showDialog(error.response.data.error || 'An error occurred. Please try again.');
        } else {
            showDialog('Unable to connect to the server. Please check your internet connection.');
        }
    }
};

  
  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Log In</Text>

        {/* Input for email */}
        <TextInput
  style={styles.input}
  placeholder="Email or Username"
  placeholderTextColor="#ccc"
  value={login}
  onChangeText={setLogin} // Zmienna login
  autoCapitalize="none"
/>



        {/* Input for password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login button */}
        <TouchableOpacity testID="login-button" style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        {/* Dialog */}
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Notification</Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: '#fff' }}>{dialogMessage}</Text>
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
