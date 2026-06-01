import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { TabParamList } from './types';
import { colors, spacing, radius } from '../constants/theme';

const Tab = createBottomTabNavigator<TabParamList>();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [showAdd, setShowAdd] = useState(false);

  const tabs = [
    { name: 'Dashboard', label: 'Home', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'History', label: 'History', icon: 'time-outline', activeIcon: 'time' },
    { name: 'Goals', label: 'Goals', icon: 'flag-outline', activeIcon: 'flag' },
    { name: 'Insights', label: 'Insights', icon: 'bulb-outline', activeIcon: 'bulb' },
  ];

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
                color={isFocused ? colors.mintDark : colors.charcoalLight}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.fabSpace}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={32} color={colors.white} />
          </TouchableOpacity>
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
                color={isFocused ? colors.mintDark : colors.charcoalLight}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
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
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.charcoalLight,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.mintDark,
    fontWeight: '600',
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
    backgroundColor: colors.mintDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.mintDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
