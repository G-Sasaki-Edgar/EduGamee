import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


import PerfilUsuario from '../screens/dashboardEstudiante/PerfilUsuario';
import Mistareas from '../screens/dashboardEstudiante/Mistareas';
import EntregarTarea from '../screens/dashboardEstudiante/EntregarTarea';






import LoginScreen from '../screens/auth/LoginScreen';
import StudentDashboard from '../screens/dashboardEstudiante/StudentDashboard';
import Ranking from '../screens/dashboardEstudiante/Ranking';
import Logros from '../screens/dashboardEstudiante/Logros';
import Incribirse from '../screens/dashboardEstudiante/Incribirse';



import { Colors } from '../constants/theme';
import DocenteDashboard from '../screens/dashboard/DocenteDashboard';
import CursoFormScreen from '../screens/dashboard/CursoFormScreen';
import TareaFormScreen from '../screens/dashboard/TareaFormScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import RevisionDocente from '../screens/dashboard/RevisionDocente';
import MisCursos from '../screens/dashboard/MisCursos';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const drawerItems = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'home-outline' },
  { name: 'Mistareas', label: 'Mis Tareas', icon: 'clipboard-outline' },
  { name: 'Perfil', label: 'Perfil', icon: 'person-outline' },
  { name: 'Ranking', label: 'Ranking', icon: 'trophy-outline' },
  { name: 'Logros', label: 'Logros', icon: 'medal-outline' },
  { name: 'Incribirse', label: 'Unirse a Curso', icon: 'enter-outline' },
];

const drawerItemsDocente = [
  { name: 'DocenteDashboard', label: 'Dashboard', icon: 'home-outline' },
  { name: 'Profile', label: 'Perfil', icon: 'person-outline' },
  { name: 'CrearCurso', label: 'Crear Curso', icon: 'add-circle-outline' },
  { name: 'MisCursos', label: 'Mis Cursos', icon: 'book-outline' },
  { name: 'TareasDocente', label: 'Tareas', icon: 'create-outline' },
  { name: 'RevisionDocente', label: 'Revisar Tareas', icon: 'checkmark-circle-outline' },
];

function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const activeRoute = state.routeNames[state.index];
  const rol = props.rol || "estudiante";
  const items = rol === "docente" ? drawerItemsDocente : drawerItems;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      <View style={styles.drawerHeader}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>ED</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>EduGameFy</Text>
          <Text style={styles.brandRole}>{rol === "docente" ? "Docente" : "Estudiante"}</Text>
        </View>
      </View>

      <View style={styles.drawerMenu}>
        {items.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={isActive ? styles.drawerItemActive : styles.drawerItem}
              onPress={() => navigation.navigate(item.name)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? '#7C3AED' : '#6B7280'}
                style={{ marginLeft: 10 }}
              />
              <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} rol="estudiante" />}
      screenOptions={{ headerShown: false, drawerType: 'front', swipeEdgeWidth: 64 }}
    >
      
      <Drawer.Screen name="Dashboard" component={StudentDashboard} />
      <Drawer.Screen name="Mistareas" component={Mistareas} />
      <Drawer.Screen name="EntregarTarea" component={EntregarTarea} />
      
      <Drawer.Screen name="Perfil" component={PerfilUsuario} />
      <Drawer.Screen name="Ranking" component={Ranking} />
      <Drawer.Screen name="Logros" component={Logros} />
      <Drawer.Screen name="Incribirse" component={Incribirse}/>

      
    </Drawer.Navigator>
  );
}

function DrawerRoutesDocente() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} rol="docente" />}
      screenOptions={{ headerShown: false, drawerType: 'front', swipeEdgeWidth: 64 }}
    >
      <Drawer.Screen name="DocenteDashboard" component={DocenteDashboard} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="CrearCurso" component={CursoFormScreen} />
      <Drawer.Screen name="TareasDocente" component={TareaFormScreen} />

      <Drawer.Screen name="RevisionDocente" component={RevisionDocente} />
      <Drawer.Screen name="MisCursos" component={MisCursos} />
      
    
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerScroll: { flex: 1, backgroundColor: '#fff' },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 20, marginTop: 20,
  },
  brandBadge: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  brandBadgeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  brandTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMain },
  brandRole: { color: '#6B7280', marginTop: 4 },
  drawerMenu: { flex: 1, paddingTop: 6 },
  drawerItem: { borderRadius: 14, marginHorizontal: 10, marginVertical: 4, flexDirection: 'row', alignItems: 'center', padding: 10 },
  drawerItemActive: { borderRadius: 14, marginHorizontal: 10, marginVertical: 4, backgroundColor: '#EEF2FF', flexDirection: 'row', alignItems: 'center', padding: 10 },
  drawerLabel: { fontSize: 16, color: '#374151', marginLeft: 10 },
  drawerLabelActive: { color: Colors.primary, fontWeight: '700' },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainEstudiante" component={DrawerRoutes} />
        <Stack.Screen name="MainDocente" component={DrawerRoutesDocente} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}