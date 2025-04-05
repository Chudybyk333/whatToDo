import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import FooterBar from './components/FooterBar';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Import potrzebny do useFocusEffect

const { height } = Dimensions.get('window');

export default function Groups({ navigation }) {
  const [groups, setGroups] = useState([]);

  // Pobieranie grup użytkownika po załadowaniu komponentu
  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/groups', {
        withCredentials: true, // Umożliwia przesyłanie ciasteczek z sesją
      });
      const groupItems = response.data.map((group) => ({
        name: group.name,
        id: group.id,
      }));
      setGroups(groupItems);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
      fetchGroups(); // Wywołanie funkcji po ustawieniu userID
  }, []);

  // Pobranie danych przy każdym powrocie do tego ekranu
  useFocusEffect(
    useCallback(() => {
      fetchGroups(); // Pobranie grup przy każdym powrocie do ekranu
    }, [])
  );

  // Funkcja do przejścia do szczegółów grupy
  const navigateToGroupDetails = (group) => {
    navigation.navigate('GroupDetails', { group });
  };

  // Funkcja do przejścia na ekran dodawania grupy
  const navigateToAddGroup = () => {
    navigation.navigate('AddGroupScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Groups</Text>
      <ScrollView style={styles.groupList}>
        {groups.length > 0 ? (
          groups.map((group) => (
            <TouchableOpacity key={group.id} onPress={() => navigateToGroupDetails(group)}>
              <View style={styles.groupItem}>
                <Text style={styles.groupText}>{group.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noGroupsText}>You are not in any groups yet.</Text>
        )}
      </ScrollView>
      <View style={styles.addGroupContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={navigateToAddGroup}>
          <Image
            source={require('../../assets/plus-icon.png')}
            style={styles.plusIcon}
          />
        </TouchableOpacity>
      </View>
      <FooterBar navigation={navigation} />
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
  groupList: {
    maxHeight: height-275,
  },
  groupItem: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupText: {
    color: '#fff',
    fontSize: 18,
  },
  noGroupsText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  addGroupContainer: {
    position: 'absolute',
    bottom: 160,
    right: 40,
    width: '100%',
    alignItems: 'flex-end',
  },
  floatingButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 35,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  plusIcon: {
    width: 60,
    height: 60,
    tintColor: '#6C63FF',
  },
});
