import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill in all fields!");
    return;
  }

  // For demo, pretend login is successful if email and password are not empty
  const isLoginSuccessful = true;

  if (isLoginSuccessful) {
    try {
      // Save login info locally
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password); // optional

      // Navigate to Module
      navigation.replace('Module', { email, password });
    } catch (error) {
      console.log('Error saving login state', error);
    }
  }
};
