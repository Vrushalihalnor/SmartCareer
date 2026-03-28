// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import Index from "./index";
import Register from "./register";
import Login from "./Login";
import Module from "./module";
import Test from "./Test";
import Report from "./Report";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Index"
        screenOptions={{
          headerStyle: { backgroundColor: "#1E90FF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerTitleAlign: "center",
        }}
      >
        {/* Welcome / Landing screen */}
        <Stack.Screen
          name="Index"
          component={Index}
          options={{ headerShown: false }}
        />

        {/* Authentication screens */}
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ title: "Register" }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: "Login" }}
        />

        {/* Main module / navigation */}
        <Stack.Screen
          name="Module"
          component={Module}
          options={{ title: "Module" }}
        />

        {/* Test screen with custom back button */}
        <Stack.Screen
          name="Test"
          component={Test}
          options={{ headerShown: false }} // We'll use a custom back button in TestScreen
        />

        {/* Report screen with custom back button */}
        <Stack.Screen
          name="Report"
          component={Report}
          options={{ headerShown: false }} // We'll use a custom back button in ReportScreen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
