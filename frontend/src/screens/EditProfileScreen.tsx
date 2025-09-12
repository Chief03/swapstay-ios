import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

const EditProfileScreen: React.FC = () => {
  const handleSaveProfile = () => {
    Alert.alert('Profile', 'Profile editing functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Profile management coming soon!</Text>
      
      <Button 
        mode="contained" 
        onPress={handleSaveProfile}
        style={styles.button}
      >
        Save Changes
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});

export default EditProfileScreen;