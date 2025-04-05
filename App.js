import React, { useState, useEffect } from 'react'; // Importujemy useState i useEffect
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, ActivityIndicator, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

// Importuj strony
import Start from './App/Pages/Start';
import SignUp from './App/Pages/Signup';
import LogIn from './App/Pages/Login';
import AddTaskScreen from './App/Pages/AddTaskScreen';
import More from './App/Pages/More';
import AccountSettings from './App/Pages/AccountSettings';
import Notifications from './App/Pages/Notifications';
import FAQ from './App/Pages/FAQ';
import Groups from './App/Pages/Groups';
import Tasks from './App/Pages/Tasks';
import Calendar from './App/Pages/Calendar';
import AddGroupScreen from './App/Pages/AddGroupScreen';
import GroupDetails from './App/Pages/GroupDetails';
import EditGroupScreen from './App/Pages/EditGroupScreen';
import AddUserScreen from './App/Pages/AddUserScreen';
import EditTaskScreen from './App/Pages/EditTaskScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.defaults.withCredentials = true; // Send cookies with requests
    const checkUserSession = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/check-session');
        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  const initialRoute = user ? 'Tasks' : 'Start';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute} // Używamy dynamicznego initialRoute
        screenOptions={{
          headerStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            backgroundColor: '#121212',
            borderBottomColor:'#121212',
          },
          headerTintColor: '#6C63FF',
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            paddingLeft: 5,
            color: '#fff',
            textAlign: 'center',
            backgroundColor: '#121212',
            borderBottomColor:'#121212',
          },
        }}
      >
        <Stack.Screen
          name="Start"
          component={Start}
          options={{ title: 'What To Do...', headerShown: false }}
        />
        
        <Stack.Screen
          name="LogIn"
          component={LogIn}
          options={({ navigation }) => ({
            title: 'Log In',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Start')}>
                <Icon name="arrow-back" size={30} color="#6C63FF" style={{ marginLeft: 15}} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={({ navigation }) => ({
            title: 'Sign Up',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Start')}>
                <Icon name="arrow-back" size={30} color="#6C63FF" style={{ marginLeft: 15}} />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Ekran Tasks */}
        <Stack.Screen
          name="Tasks"
          component={Tasks}
          options={{ title: 'Tasks', headerShown: false }}
        />

        {/* Inne ekrany */}
        <Stack.Screen
        name="AddTaskScreen"
        component={AddTaskScreen}
        options={{ title: 'Add Task'}}
        />
        <Stack.Screen
          name="Calendar"
          component={Calendar}
          options={{ title: 'Calendar', headerShown: false }}
        />
        <Stack.Screen
          name="Groups"
          component={Groups}
          options={{ title: 'Groups', headerShown: false }}
        />
        <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} />
        <Stack.Screen 
          name="AddGroupScreen" 
          component={AddGroupScreen}
        />
        <Stack.Screen
          name="GroupDetails"
          component={GroupDetails}
          options={{
            headerBackTitleVisible: false,
            headerTintColor: '#6C63FF',
          }}
        />
        <Stack.Screen name="AddUserScreen" component={AddUserScreen} />
        <Stack.Screen name="EditTaskScreen" component={EditTaskScreen}
        options={{ title: 'Edit Task'}}
        />
        <Stack.Screen
          name="More"
          component={More}
          options={{ title: 'More options', headerShown: false }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{ title: 'Account settings' }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen
          name="FAQ"
          component={FAQ}
          options={{ title: 'Frequently asked questions' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
