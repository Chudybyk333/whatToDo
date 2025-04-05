import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';

const { height } = Dimensions.get('window');

export default function GroupDetails({ route, navigation }) {
  const { group } = route.params;
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedTab === 'tasks') {
      fetchTasks();
    } else if (selectedTab === 'users') {
      fetchUsers();
    }
  }, [selectedTab]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(); // Pobranie danych przy każdym powrocie do tego ekranu
    }, [])
  );

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/group/tasks', { groupId: group.id }, { withCredentials: true });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/group/users', { groupId: group.id }, { withCredentials: true });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const toggleCompletion = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedStatus = !taskToUpdate.status;

    try {
      const response = await axios.put(
        'http://localhost:3000/api/change-task-status',
        {
          taskId: taskId,
          status: updatedStatus,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
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

  const handleEditGroup = () => {
    navigation.navigate('EditGroupScreen', { group });
  };

  const addTask = () => {
    navigation.navigate('AddTaskScreen', { groupId: group.id });
  };

  const addUser = () => {
    navigation.navigate('AddUserScreen', { groupId: group.id });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={styles.groupName}>{group.groupName}</Text>,
      headerStyle: { backgroundColor: '#121212', borderBottomColor: '#121212' },
      headerRight: () => (
        <TouchableOpacity onPress={handleEditGroup}>
          <Image
            source={require('../../assets/pencil.png')}
            style={styles.pencilIcon}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, group.groupName]);

  const showTaskOptions = (taskId) => {
    setShowOptions(taskId === showOptions ? null : taskId);
  };

  const toggleNote = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'tasks' && styles.activeTab]}
          onPress={() => setSelectedTab('tasks')}
        >
          <Text style={[styles.tabText, selectedTab === 'tasks' && styles.activeTabText]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'users' && styles.activeTab]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'tasks' ? (
        <FlatList
          style={styles.listContainer}
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <View style={styles.taskIconsContainer}>
                  <TouchableOpacity onPress={() => toggleCompletion(item.id)}>
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
                    style={[styles.taskText, item.status && styles.taskTextCompleted]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.taskDate}>
                    Due: {new Date(item.deadline).toDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuButton} onPress={() => showTaskOptions(item.id)}>
                  <Image source={require('../../assets/menu-dots.png')} style={styles.dotsIcon} />
                </TouchableOpacity>
              </View>

              {showOptions === item.id && (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.optionButton}>
                    <Image source={require('../../assets/trash-bin.png')} style={styles.optionIconRed} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('EditTaskScreen', { task: item, groupId: group.id })} style={styles.optionButton}>
                    <Image source={require('../../assets/pencil.png')} style={styles.optionIcon} />
                  </TouchableOpacity>
                </View>
              )}

              {expandedTaskId === item.id && (
                <View>
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
        />
      ) : (
        <FlatList
          style={styles.listContainer}
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <View style={styles.taskIconsContainer}>
                  <Image
                    source={require('../../assets/circle-user.png')}
                    style={styles.statusIcon}
                  />
                </View>
                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskText}>{item.name}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No users yet. Add a user!</Text>}
          contentContainerStyle={styles.flatListContent}
        />
      )}

      <View style={styles.addTaskContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={selectedTab === 'tasks' ? addTask : addUser}>
          <Image
            source={require('../../assets/plus-icon.png')}
            style={styles.plusIcon}
          />
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
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pencilIcon: {
    width: 20,
    height: 20,
    tintColor: '#6C63FF',
    marginRight: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: '#6C63FF',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
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
    marginBottom: 10,
  },
  taskText: {
    fontSize: 18,
    color: '#fff',
  },
  taskDate: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  taskNote: {
    fontSize: 14,
    color: '#fff',
  },
  emptyText: {
    color: '#8e8e8e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  taskIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  taskTextContainer: {
    flex: 1,
  },
  statusIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    tintColor: '#6C63FF',
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
  addTaskContainer: {
    position: 'absolute',
    bottom: 80,
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
  optionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 60,
    top: 20,
  },
  optionButton: {
    marginLeft: 20,
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
    color: '#8e8e8e',
  },
  flatListContent: {
    paddingBottom: 60,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    maxHeight: height - 275,
  },
});
