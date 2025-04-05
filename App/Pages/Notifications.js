import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function Notifications() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    // Pobieranie zaproszeń po załadowaniu komponentu
    const fetchInvitations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/notifications', { withCredentials: true });
        setInvitations(response.data.invitations);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch invitations.');
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (invitationId) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/accept-invitation',
        { invitationId },
        { withCredentials: true }
      );
      Alert.alert('Success', response.data.message);
      // Po zaakceptowaniu zaproszenia, odśwież listę zaproszeń
      setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to accept invitation.');
    }
  };

  const handleDecline = async (invitationId) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/decline-invitation',
        { invitationId },
        { withCredentials: true }
      );
      Alert.alert('Success', response.data.message);
      // Po odrzuceniu zaproszenia, odśwież listę zaproszeń
      setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to decline invitation.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              You have been invited to the group "{item.group.name}" by {item.sender.name}.
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item.id)}>
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
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
  notification: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  notificationText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#6C63FF',
    padding: 10,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
