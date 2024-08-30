import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import auth from "@react-native-firebase/auth";
import LoginScreen from "./app/screens/LoginScreen";
import { configureGoogleSignIn } from "./app/services/googleSignin";
import HomeScreen from "./app/screens/HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    configureGoogleSignIn();

    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {!user ? (
          <LoginScreen />
        ) : (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarLabelPosition: "below-icon",
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            {/* Add more screens here as needed */}
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
