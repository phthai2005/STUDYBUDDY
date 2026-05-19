import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';

// Nhập các màn hình chính
import MatchScreen from './screens/Main/MatchScreen';
import ChatListScreen from './screens/Main/ChatListScreen';
import ChatRoomScreen from './screens/Main/ChatRoomScreen';
import CreateMeetingScreen from './screens/Main/CreateMeetingScreen';
import FileShareScreen from './screens/Main/FileShareScreen';
import PeerReviewScreen from './screens/Review/PeerReviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreateGroupScreen from './screens/Main/CreateGroupScreen';
import { registerForPushNotificationsAsync } from './services/notification';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

export default function App() {
  React.useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <LocationProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#FF9500',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  color: '#1C1C1E',
                },
                headerBackTitleVisible: false,
              }}
            >
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChatRoom"
                component={ChatRoomScreen}
              />
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
          </NavigationContainer>
        </LocationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
