import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';

export default function EditTaskScreen({ route, navigation }) {
  const { task, groupId } = route.params || {}; // Otrzymujemy dane zadania do edytowania
  // Stany do przechowywania wartości formularza
  const [taskName, setTaskName] = useState(task.name);
  const [taskDate, setTaskDate] = useState(task.deadline);
  const [taskNote, setTaskNote] = useState(task.notes);
  const [selectedGroup, setSelectedGroup] = useState(task.groupID);
  const [showCalendar, setShowCalendar] = useState(false);

  console.log(task.groupID);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  // Pobieramy dostępne grupy użytkownika
  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/groups');
      const groupItems = response.data.map((group) => ({
        label: group.name,  // Assuming `name` is the group name field
        value: group.id,    // Assuming `id` is the group identifier
      }));
      setItems(groupItems);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert('Failed to load groups. Please try again.');
    }
  };

  // Funkcja do zapisywania zaktualizowanego zadania
  const handleSaveChanges = async () => {
    if (taskName.trim() && taskDate) {
      const updatedTask = {
        taskId: task.id,      // ID zadania do aktualizacji
        name: taskName,
        notes: taskNote || '',
        deadline: new Date(taskDate).toISOString().split('T')[0],
        groupID: selectedGroup || task.groupID,  // Przekazujemy wybraną grupę
      };

      try {
        const response = await axios.put('http://localhost:3000/api/update-task', updatedTask, {
          withCredentials: true, // Zapewnienie, że sesja jest zachowywana
        });

        if (response.status === 200) {
          navigation.goBack();  // Powrót do poprzedniego ekranu
        } else {
          alert('Failed to update task. Unexpected response from the server.');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        if (error.response) {
          const errorMessage = error.response.data.error || 'Unknown error';
          alert(`Failed to update task: ${errorMessage}`);
        } else {
          alert('Failed to update task. Please check your internet connection.');
        }
      }
    } else {
      alert('Please enter a task name and a due date!');
    }
  };

  const handleDateSelect = (day) => {
    setTaskDate(day.dateString.split('T')[0]);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.header}> </Text>

        <TextInput
          style={styles.input}
          value={taskName}
          onChangeText={setTaskName}
          placeholder="Task Name"
          placeholderTextColor="#8e8e8e"
        />

        <TextInput
          style={[styles.input, styles.noteInput]}
          value={taskNote}
          onChangeText={setTaskNote}
          placeholder="Task Note (optional)"
          placeholderTextColor="#8e8e8e"
          multiline
        />

        {groupId ? null:<DropDownPicker
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
          arrowIconStyle={{ tintColor: '#FFFFFF' }}
        />
        }
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.dateButtonText}>
            Set Date: {taskDate.split('T')[0] ? taskDate.split('T')[0] : 'Select a date'}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={taskDate.split('T')[0]}
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

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'space-between',
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
    backgroundColor: '#1E1E1E',
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 35,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveText: {
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
