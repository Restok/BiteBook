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
import { UserProvider } from "./app/contexts/UserContext";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { default as darkTheme } from "./app/constants/theme/dark.json";
import { default as lightTheme } from "./app/constants/theme/light.json";
import { default as customTheme } from "./app/constants/theme/appTheme.json";
import { default as customMapping } from "./app/constants/theme/mapping.json";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import FoodAnalysisScreen from "./app/screens/FoodAnalysisScreen";
import LeaderboardScreen from "./app/screens/LeaderboardScreen";
import JoinJournalScreen from "./app/screens/JoinJournalScreen";
import EnterInviteCodeScreen from "./app/screens/EnterInviteCodeScreen";
import UserStatsScreen from "./app/screens/UserStatsScreen";
import HealthScoreExpandedScreen from "./app/screens/HealthScoreExpandedScreen";
import TopFoodsExpandedScreen from "./app/screens/TopFoodsExpandedScreen";
import { LoadingProvider } from "./app/contexts/LoadingContext";
import { LoaderScreen } from "react-native-ui-lib";
import LoadingScreen from "./app/screens/LoadingScreen";
import { ConfettiProvider } from "./app/contexts/ConfettiContext";
import Confetti from "./app/components/utils/Confetti";
import {
  OnboardingProvider,
  useOnboarding,
} from "./app/contexts/OnboardingContext";
const Tab = createBottomTabNavigator();

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<RootStackParamList>();
const OnboardingStack = createStackNavigator<RootStackParamList>();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const OnboardingNavigator: React.FC = () => (
  <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <OnboardingStack.Screen name="Onboarding" component={OnboardingScreen} />
  </OnboardingStack.Navigator>
);

const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="UserStats" component={UserStatsScreen} />
    <Stack.Screen name="JoinJournal" component={JoinJournalScreen} />
    <Stack.Screen
      name="HealthScoreExpanded"
      component={HealthScoreExpandedScreen}
    />
    <Stack.Screen name="TopFoodsExpanded" component={TopFoodsExpandedScreen} />
    <Stack.Screen name="EnterInviteCode" component={EnterInviteCodeScreen} />
    <Stack.Screen name="CreateJournal" component={CreateJournalScreen} />
    <Stack.Screen name="ExpandBitebook" component={ExpandBitebookScreen} />
    <Stack.Screen name="ExpandedPost" component={ExpandedPostScreen} />
    <Stack.Screen name="FoodAnalysis" component={FoodAnalysisScreen} />
    <Stack.Screen name="JournalCreated" component={JournalCreatedScreen} />
  </Stack.Navigator>
);

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

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
          if (error.code === "permission-denied") {
            setOnboardingComplete(false);
          }
        }
      } else {
        setOnboardingComplete(false);
      }
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  const AppContent = () => {
    const { onboardingComplete } = useOnboarding();
    const user = auth().currentUser;

    if (onboardingComplete === null) {
      return null; // or return a loading component if you prefer
    }

    if (!user) {
      return <AuthNavigator />;
    }
    if (!onboardingComplete) {
      return <OnboardingNavigator />;
    }
    return <MainNavigator />;
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <IconRegistry icons={[EvaIconsPack]} />
      <ApplicationProvider
        {...eva}
        theme={
          theme === "light"
            ? { ...eva.light, ...customTheme, ...lightTheme }
            : { ...eva.dark, ...customTheme, ...darkTheme }
        }
        customMapping={customMapping}
      >
        <ConfettiProvider>
          <LoadingProvider>
            <JournalProvider>
              <UserProvider>
                <OnboardingProvider>
                  <Confetti />
                  <LoadingScreen />
                  <NavigationContainer>{<AppContent />}</NavigationContainer>
                </OnboardingProvider>
              </UserProvider>
            </JournalProvider>
          </LoadingProvider>
        </ConfettiProvider>
      </ApplicationProvider>
    </GestureHandlerRootView>
  );
};

export default App;
