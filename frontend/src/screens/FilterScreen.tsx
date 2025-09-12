import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

const FilterScreen: React.FC = () => {
  const handleFilterPress = () => {
    Alert.alert('Filter', 'Filter functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Listings</Text>
      <Text style={styles.subtitle}>Search and filter options coming soon!</Text>
      
      <Button 
        mode="contained" 
        onPress={handleFilterPress}
        style={styles.button}
      >
        Apply Filters
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

export default FilterScreen;