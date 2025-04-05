import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function AddTaskScreen({ route, navigation }) {
  const { groupId } = route.params || {};
  console.log(groupId);
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Select a date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTaskDate(today);
  }, []);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/groups');
      const groupItems = response.data.map((group) => ({
        label: group.name,
        value: group.id,
      }));
      setItems(groupItems);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert('Failed to load groups. Please try again.');
    }
  };

  const handleAddTask = async () => {
    if (taskName.trim() && taskDate) {
      const newTask = {
        name: taskName,
        notes: taskNote || '',
        deadline: taskDate,
        groupID: selectedGroup || groupId,
      };

      try {
        const response = await axios.post('http://localhost:3000/api/add-task', newTask, {
          withCredentials: true,
        });

        if (response.status === 201) {
          console.log('Task added successfully:', response.data);
          setTaskName('');
          setTaskDate('');
          setTaskNote('');
          setSelectedGroup(groupId ? null : groupId);
          navigation.goBack();
        } else {
          alert('Failed to add task. Unexpected response from the server.');
        }
      } catch (error) {
        console.error('Error adding task:', error);
        if (error.response) {
          const errorMessage = error.response.data.error || 'Unknown error';
          alert(`Failed to add task: ${errorMessage}`);
        } else {
          alert('Failed to add task. Please check your internet connection.');
        }
      }
    } else {
      alert('Please enter a task name and a due date!');
    }
  };

  const handleDateSelect = (day) => {
    setTaskDate(day.dateString);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.topContainer}>
          <Text style={styles.header}> </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task name"
            placeholderTextColor="#8e8e8e"
            value={taskName}
            onChangeText={setTaskName}
          />
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add a note (optional)"
            placeholderTextColor="#8e8e8e"
            value={taskNote}
            onChangeText={setTaskNote}
            multiline
          />
          {groupId ? null: <DropDownPicker
            open={open}
            value={selectedGroup}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedGroup}
            setItems={setItems}
            placeholder="Select a group"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            textStyle={styles.textStyle}
          />
          }
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(true)}
          >
            <Image source={require('../../assets/calendar-clock.png')} style={styles.calendarIcon} />
            <Text style={styles.dateButtonText}>
              <Text style={styles.dateText}>{formatDate(taskDate)}</Text>
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                current={taskDate}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={{
                  [taskDate]: {
                    selected: true,
                    selectedColor: '#6C63FF',
                    selectedTextColor: '#FFFFFF',
                  },
                }}
                theme={{
                  backgroundColor: '#121212',
                  calendarBackground: '#1E1E1E',
                  textSectionTitleColor: '#FFFFFF',
                  selectedDayBackgroundColor: '#6C63FF',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#6C63FF',
                  dayTextColor: '#FFFFFF',
                  arrowColor: '#6C63FF',
                  monthTextColor: '#FFFFFF',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between', // Ensures the button is at the bottom
  },
  calendarIcon:
  {
    tintColor: '#FFFFFF',
    width: 30,
    height: 30,
    marginRight: 10,
  },
  topContainer: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
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
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    borderWidth: 0,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  dropdownContainer: {
    backgroundColor: '#1E1E1E',
    borderWidth: 0,
  },
  placeholderStyle: {
    color: '#8e8e8e',
    fontSize: 16,
  },
  textStyle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 35,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    flexDirection: 'row',  // Align icon and text horizontally
    paddingLeft: 10, // Add padding to the left for the icon
    paddingRight: 10, // Optional: space between the icon and text
  },
  dateButtonText: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  dateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto', // Pushes the button to the bottom
    marginBottom: 20, // Added margin at the bottom for space
    marginRight: 20,
    marginLeft: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
  },
});