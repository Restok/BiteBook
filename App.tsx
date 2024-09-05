import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import LoginScreen from "./app/screens/LoginScreen";
import OnboardingScreen from "./app/screens/OnboardingScreen";
import { configureGoogleSignIn } from "./app/services/googleSignin";
import HomeScreen from "./app/screens/HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import CreateJournalScreen from "./app/screens/CreateJournalScreen";
import ExpandBitebookScreen from "./app/screens/ExpandBitebookScreen";
import ExpandedPostScreen from "./app/screens/ExpandedPostScreen";
import JournalCreatedScreen from "./app/screens/JournalCreatedScreen";
import { RootStackParamList } from "./app/types/navigation";
import { JournalProvider } from "./app/contexts/JournalContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarLabelPosition: "below-icon",
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    {/* Add more tab screens here as needed */}
  </Tab.Navigator>
);
const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();

    const subscriber = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await firestore()
            .collection("users")
            .doc(user.uid)
            .get();
          if (userDoc.exists) {
            const personalJournalDoc = await firestore()
              .collection("journals")
              .doc(user.uid)
              .get();

            setOnboardingComplete(personalJournalDoc.exists);
          } else {
            setOnboardingComplete(false);
          }
        } catch (error) {
          console.log(error.code);
          if (error.code === "permission-denied") {
            setOnboardingComplete(false);
          }
        }
      }
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  if (!user) {
    return <LoginScreen />;
  }
  console.log("onboardingComplete", onboardingComplete);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JournalProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : !onboardingComplete ? (
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen
                    {...props}
                    onComplete={() => setOnboardingComplete(true)}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="CreateJournal"
                  component={CreateJournalScreen}
                />
                <Stack.Screen
                  name="ExpandBitebook"
                  component={ExpandBitebookScreen}
                />
                <Stack.Screen
                  name="ExpandedPost"
                  component={ExpandedPostScreen}
                />
                <Stack.Screen
                  name="JournalCreated"
                  component={JournalCreatedScreen}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </JournalProvider>
    </GestureHandlerRootView>
  );
};

export default App;
