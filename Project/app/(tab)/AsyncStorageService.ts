import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveLogin = async (email: string, password: string) => {
  await AsyncStorage.setItem('isLoggedIn', 'true');
  await AsyncStorage.setItem('email', email);
  await AsyncStorage.setItem('password', password);
};

export const getLogin = async () => {
  const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
  const email = await AsyncStorage.getItem('email');
  const password = await AsyncStorage.getItem('password');
  return { isLoggedIn, email, password };               
};

export const clearLogin = async () => {
  await AsyncStorage.clear();
};
