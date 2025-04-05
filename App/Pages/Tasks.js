import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';

import FooterBar from './components/FooterBar';

const {height} = Dimensions.get('window');

export default function Tasks({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [loading, setLoading] = useState(true); // Stan ładowania
  const [error, setError] = useState(null); // Stan błędu

  // Funkcja do pobierania zadań z API
    const fetchTasks = async () => {
      setLoading(true);  // Ustawiamy loading na true przed pobraniem
      try {
        const response = await axios.get('http://localhost:3000/api/tasks', { withCredentials: true });
        setTasks(response.data);  // Ustawiamy dane w stanie
        setLoading(false);  // Zakończenie ładowania
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks'); // Ustawienie błędu
        setLoading(false);  // Zakończenie ładowania
      }
    };

// Wywołaj `fetchTasks` wewnątrz `useEffect` podczas inicjalizacji komponentu
useEffect(() => {
  fetchTasks();
}, []);

useFocusEffect(
  useCallback(() => {
    fetchTasks(); // Pobranie danych przy każdym powrocie do tego ekranu
  }, [])
);


  // Funkcja do przełączania statusu zadania (circle <-> dot-circle)
  const toggleCompletion = async (taskId) => {
    // Wyszukaj zadanie w stanie
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return; // Jeśli zadanie nie istnieje, zakończ
  
    // Przełącz status zadania (z false na true lub odwrotnie)
    const updatedStatus = !taskToUpdate.status;
  
    try {
      // Wyślij zapytanie PUT do serwera, aby zaktualizować status zadania
      const response = await axios.put(
        'http://localhost:3000/api/change-task-status',
        {
          taskId: taskId,
          status: updatedStatus, // Nowy status zadania
        },
        { withCredentials: true }
      );
  
      // Sprawdź, czy odpowiedź jest poprawna
      if (response.status === 200) {
        // Zaktualizuj stan w aplikacji po pomyślnym zaktualizowaniu statusu
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: !task.status } : task
          )
        );
        } else {
        alert('Failed to update task status. Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert(`Failed to update task status: ${error.response?.data.error || 'Unknown error'}`);
    }
  };


  // Funkcja do usuwania zadania
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.delete(
        'http://localhost:3000/api/delete-task',
        {
          data: { taskId },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Usuń zadanie ze stanu
        await fetchTasks(); // Pobierz odświeżone dane po aktualizacji
      } else {
        alert('Failed to delete task. Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Failed to delete task: ${error.response?.data.error || 'Unknown error'}`);
    }
  };

  // Funkcja do pokazania opcji po naciśnięciu trzech kropek
  const showTaskOptions = (taskId) => {
    setShowOptions(taskId === showOptions ? null : taskId);
  };

  // Funkcja do rozwijania/zwijania notatki
  const toggleNote = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };

  // Obsługa stanu ładowania i błędu
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={styles.taskHeader}>
              <View style={styles.taskIconsContainer}>
                <TouchableOpacity onPress={() => toggleCompletion(item.id)} testID={`status-icon-${item.id}`}>
                  <Image
                    source={
                      item.status
                        ? require('../../assets/square-check.png')
                        : require('../../assets/square.png')
                    }
                    style={styles.statusIcon}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => toggleNote(item.id)}
                style={styles.taskTextContainer}
              >
                <Text
                  style={[
                    styles.taskText,
                    item.status && styles.taskTextCompleted, // Styl przekreślonego tekstu
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.taskDate}>
                  Due: {new Date(item.deadline).toDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => showTaskOptions(item.id)}  testID={`menu-button-${item.id}`}> 
                <Image source={require('../../assets/menu-dots.png')} style={styles.dotsIcon} />
              </TouchableOpacity>
            </View>

            {showOptions === item.id && (
              <View style={styles.optionsContainer} testID={`options-menu-${item.id}`}>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.optionButton} testID={`delete-button-${item.id}`}>
                  <Image source={require('../../assets/trash-bin.png')} style={styles.optionIconRed} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('EditTaskScreen', { task: item })} style={styles.optionButton}>
                  <Image source={require('../../assets/pencil.png')} style={styles.optionIcon} />
                </TouchableOpacity>
              </View>
            )}

            {expandedTaskId === item.id && (
              <View>
                {item.groupName && <Text style={styles.taskGroup}>Group: {item.groupName}</Text>}
                {item.notes ? (
                  <Text style={styles.taskNote}>{item.notes}</Text>
                ) : (
                  <Text style={styles.taskNote}>No notes available.</Text>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add a task!</Text>}
        contentContainerStyle={styles.flatListContent}
        style={styles.listContainer}
      />

      <FooterBar navigation={navigation} />

      <View style={styles.addTaskContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('AddTaskScreen')}>
          <Image source={require('../../assets/plus-icon.png')} style={styles.plusIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    position: 'relative',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  taskItem: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  taskIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    tintColor: '#6C63FF',
  },
  checkIcon: {
    width: 30,
    height: 30,
    tintColor: '#6C63FF',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    color: '#fff',
    fontSize: 18,
  },
  taskDate: {
    color: '#8e8e8e',
    fontSize: 14,
    marginTop: 5,
  },
  taskNote: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  taskGroup: {
    color: '#6C63FF',
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#8e8e8e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  addTaskContainer: {
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
  flatListContent: {
    paddingBottom: 60,
  },
  listContainer: {
    maxHeight: height-275,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dotsIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  optionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 60,
    top: 20,
  },
  optionButton: {
    marginLeft: 20, // Dodano odstęp między ikonami
  },
  optionIcon: {
    tintColor: '#6C63FF',
    width: 30,
    height: 30,
  },
  optionIconRed: {
    tintColor: '#ff6363',
    width: 30,
    height: 30,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8e8e8e', // Opcjonalnie zmień kolor na bardziej wyblakły
  },
});
