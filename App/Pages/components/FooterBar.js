import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function FooterBar({ navigation }) {
  const currentRoute = navigation.getState().routes[navigation.getState().index].name;

  const getIconTintColor = (routeName) => {
    return currentRoute === routeName ? '#6C63FF' : '#fff'; // Złoty kolor dla aktywnej ikony
  };

  return (
    <View style={styles.footerBar}>
      <TouchableOpacity 
        style={styles.footerButton} 
        onPress={() => navigation.navigate('Tasks')}
      >
        <Image
          source={require('../../../assets/document-signed.png')}
          style={[styles.footerIcon, { tintColor: getIconTintColor('Tasks') }]}
        />
        <Text 
          style={[
            styles.footerButtonText, 
            { color: getIconTintColor('Tasks') }
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.footerButton} 
        onPress={() => navigation.navigate('Calendar')}
      >
        <Image
          source={require('../../../assets/calendar-clock.png')}
          style={[styles.footerIcon, { tintColor: getIconTintColor('Calendar') }]}
        />
        <Text 
          style={[
            styles.footerButtonText, 
            { color: getIconTintColor('Calendar') }
          ]}
        >
          Calendar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.footerButton} 
        onPress={() => navigation.navigate('Groups')}
      >
        <Image
          source={require('../../../assets/users-alt.png')}
          style={[styles.footerIcon, { tintColor: getIconTintColor('Groups') }]}
        />
        <Text 
          style={[
            styles.footerButtonText, 
            { color: getIconTintColor('Groups') }
          ]}
        >
          Groups
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.footerButton} 
        onPress={() => navigation.navigate('More')}
      >
        <Image
          source={require('../../../assets/settings.png')}
          style={[styles.footerIcon, { tintColor: getIconTintColor('More') }]}
        />
        <Text 
          style={[
            styles.footerButtonText, 
            { color: getIconTintColor('More') }
          ]}
        >
          More
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    paddingVertical: 10,
    borderTopWidth: 0,
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }
});
