import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Text,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { TabParamList } from './types';
import { colors, fonts, spacing, radius } from '../constants/theme';

const Tab = createBottomTabNavigator<TabParamList>();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;

  const tabs = [
    { name: 'Dashboard', label: 'Home', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'History', label: 'History', icon: 'time-outline', activeIcon: 'time' },
    { name: 'Goals', label: 'Goals', icon: 'flag-outline', activeIcon: 'flag' },
    { name: 'Insights', label: 'Insights', icon: 'bulb-outline', activeIcon: 'bulb' },
  ];

  const pressFab = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
    setShowAdd(true);
  };

  return (
    <>
      <View style={styles.tabBar}>
        {tabs.slice(0, 2).map((tab, index) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isFocused ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isFocused ? colors.signal : colors.textMuted}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.fabSpace}>
          <Animated.View style={{ transform: [{ scale: fabScale }] }}>
            <TouchableOpacity style={styles.fab} onPress={pressFab} activeOpacity={0.9}>
              <Ionicons name="add" size={30} color={colors.ink} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {tabs.slice(2).map((tab, i) => {
          const index = i + 2;
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isFocused ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isFocused ? colors.signal : colors.textMuted}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <AddExpenseScreen onClose={() => setShowAdd(false)} />
      </Modal>
    </>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom:
      Platform.OS === 'web' ? spacing.md : Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.signal,
    fontFamily: fonts.sansSemiBold,
  },
  fabSpace: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.signal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surfaceInk,
    shadowColor: colors.signal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
