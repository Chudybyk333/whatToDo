import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import FooterBar from './components/FooterBar';

const {height} = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/tasks');
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline).toLocaleDateString('en-CA'); // Format 'YYYY-MM-DD'
    return taskDate === selectedDate;
  });

  const markedDates = tasks.reduce((acc, task) => {
    const taskDate = new Date(task.deadline).toLocaleDateString('en-CA'); // Format 'YYYY-MM-DD'
    acc[taskDate] = { marked: true, dotColor: '#6C63FF' };
    return acc;
  }, {});

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
      <Text style={styles.header}>Calendar</Text>
      <View style={styles.calendarWrapper}>
        <Calendar
          enableSwipeMonths={true}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: { selected: true, marked: false },
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
            textDayFontSize: 16,
            textMonthFontSize: 18,
          }}
        />
      </View>
      {selectedDate && (
        <>
          <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text>
          <FlatList
            style={styles.taskListContainer}
            data={filteredTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text style={styles.taskText}>{item.name}</Text>
                <Text style={styles.taskNote}>{item.notes}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.taskNote}>No tasks for this day.</Text>}
          />
        </>
      )}
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
  calendarWrapper: {
    borderRadius: 15, // Zaokrąglone rogi
    overflow: 'hidden', // Ukrycie elementów wychodzących poza obszar
    backgroundColor: '#1E1E1E', // Tło dla opakowania
  },
  calendar: {
    padding: 10, // Dodatkowe odstępy wewnątrz kalendarza
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  taskItem: {
    backgroundColor: '#333',
    padding: 15,
    marginVertical: 5,
    borderRadius: 15,
  },
  taskText: {
    color: '#fff',
    fontSize: 16,
  },
  taskListContainer: {
    maxHeight: height/3+75, // Możesz dostosować do swoich potrzeb
    marginTop: 15, // Możesz dodać odstęp do dolnego paska
  },
  taskNote: {
    color: '#D3D3D3',
    fontSize: 12,
    marginTop: 5,
  },
});
