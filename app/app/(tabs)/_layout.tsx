import { Tabs } from 'expo-router';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Home, Calendar, Plus, Settings, User } from 'lucide-react-native';

export default function TabsLayout() {
  const addSheetRef = useRef<{ open: () => void } | null>(null);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#475569',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              className="items-center justify-center"
              onPress={() => addSheetRef.current?.open()}
            >
              <View className="h-14 w-14 -mt-5 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                <Plus size={26} color="white" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
