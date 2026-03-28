import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const TabRoot = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' }, // hides the bottom tab bar
        headerShown: false, // optional: show header if you want
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabRoot;
