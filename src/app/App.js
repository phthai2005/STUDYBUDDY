import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { ThemeProvider } from '../core/ThemeContext';
import { LocationProvider } from '../core/LocationContext';
import { mockDb } from '../data/repositories/firebaseRepository';

// Nhập các màn hình chính
import MatchScreen from '../features/home/MatchScreen';
import ChatListScreen from '../features/chat/ChatListScreen';
import ChatRoomScreen from '../features/chat/ChatRoomScreen';
import CreateMeetingScreen from '../features/schedule/CreateMeetingScreen';
import FileShareScreen from '../features/chat/FileShareScreen';
import PeerReviewScreen from '../features/review/PeerReviewScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import CreateGroupScreen from '../features/chat/CreateGroupScreen';

// Nhập các màn hình xác thực
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';

import { registerForPushNotificationsAsync } from '../core/notification';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppContent() {
  const { user } = useAuth();

  React.useEffect(() => {
    async function initPushToken() {
      const token = await registerForPushNotificationsAsync();
      if (user && token) {
        await mockDb.savePushTokenForUser(user.uid, token);
      }
    }

    initPushToken();
  }, [user]);

  return <RootNavigator />;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Match"
        component={MatchScreen}
        options={{
          title: 'Tìm bạn học',
          tabBarLabel: 'Tìm bạn',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🤝</Text>
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Hộp thoại nhóm',
          tabBarLabel: 'Nhóm Chat',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
}

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#FF9500',
  headerTitleStyle: {
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerBackTitleVisible: false,
};

function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen
        name="CreateMeeting"
        component={CreateMeetingScreen}
        options={{ title: 'Lên lịch họp' }}
      />
      <Stack.Screen
        name="FileShare"
        component={FileShareScreen}
        options={{ title: 'Tài liệu chia sẻ' }}
      />
      <Stack.Screen
        name="PeerReview"
        component={PeerReviewScreen}
        options={{ title: 'Đánh giá đồng đội' }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'Tạo nhóm học mới' }}
      />
    </Stack.Navigator>
  );
}

function UnauthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Tách stack đăng nhập / chưa đăng nhập để remount khi logout (tránh kẹt tab Cá nhân)
function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  return (
    <NavigationContainer key={user ? 'authenticated' : 'unauthenticated'}>
      <StatusBar style="dark" />
      {user ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AuthProvider>
          <ThemeProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </ThemeProvider>
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
