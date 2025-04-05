import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Provider, Portal, Dialog, Button } from 'react-native-paper';
import axios from 'axios';


export default function EditGroupScreen({ route, navigation }) {
  const { group } = route.params; // Odbieramy grupę i funkcje
  const [groupName, setGroupName] = useState(group.name); // Ustawiamy nazwę grupy w stanie lokalnym
  const [isDialogVisible, setIsDialogVisible] = useState(false);


  useEffect(() => {
    setGroupName(group.name); // Upewniamy się, że stan jest aktualizowany, gdy grupa się zmienia
  }, [group]); // Zaktualizuj stan, kiedy `group` się zmienia

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  const handleSave = () => {
    if (groupName !== group.name && group.name!='General') {
      updateGroup(group.id, groupName); // Aktualizujemy nazwę grupy
    }
    navigation.navigate('Groups'); // Powrót do poprzedniego ekranu
  };

  const updateGroup = async (groupId, groupName) => {
    try {
      const response = await axios.put('http://localhost:3000/api/update-group', {
        groupId,
        groupName,
      }, {
        withCredentials: true,
      });
  
      if (response.status === 200) {
        console.log(response.data.message); // "Group name updated successfully"
      } else {
        alert('Failed to update group. Unexpected server response.');
      }
    } catch (error) {
      console.error('Error updating group:', error?.response?.data?.error || 'Unknown error');
      alert(`Failed to update group: ${error.response?.data.error || 'Unknown error'}`);
    }
  };

  const handleDeleteGroup = async (id, name) => {
    try {
      const response = await axios.delete(
        'http://localhost:3000/api/delete-group',
        {
          data: { groupId: id , groupName: name },
          withCredentials: true,
        }
      );
  
      if (response.status === 200) {
        navigation.navigate('Groups'); // Powrót do poprzedniego ekranu
      } else {
        alert('Failed to delete group. Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error deleting group:', error?.message || 'Unknown error');
      alert(`Failed to delete group: ${error.response?.data.error || 'Unknown error'}`);
    }
  };
  

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.header}>Edit: {group.name}</Text>

        {/* Pole tekstowe do edytowania nazwy grupy */}
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName} // Zaktualizowanie stanu `groupName`
          placeholder="Group Name"
          placeholderTextColor="#888"
        />

        {/* Przycisk zapisz */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Czerwony przycisk do usunięcia grupy */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={showDialog} // Wyświetlenie dialogu potwierdzenia
        >
          <Text style={styles.deleteButtonText}>Delete Group</Text>
        </TouchableOpacity>

        {/* Dialog potwierdzenia usunięcia */}
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Please confirm</Dialog.Title>
            <Dialog.Content>
              <Text style={{color:"#ffffff"}}>Are you sure you want to delete this group?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={() => handleDeleteGroup(group.id, group.name)}>Delete</Button>
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2c2c2c',
    color: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF4D4D', // Czerwony kolor przycisku
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
