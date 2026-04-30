import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';
import NotifToast from './NotifToast';

const WS_HOST = API_URL
  .replace('http://', '')
  .replace('https://', '')
  .replace('/api', '');
const WS_PROTOCOL = API_URL.startsWith('https') ? 'wss' : 'ws';

const S3_URL = 'https://edugamefy-media.s3.us-east-1.amazonaws.com/avatares';

export default function Navbar({ role = "estudiante" }) {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [toastNotif, setToastNotif] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    loadUserData();
    if (role === 'estudiante') conectarWebSocket();
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));

      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/perfil/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.rol === 'docente') {
          setAvatarUrl(`${S3_URL}/Docente.jpg`);
        } else {
          setAvatarUrl(`${S3_URL}/Alumno.jpg`);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const conectarWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      ws.current = new WebSocket(
        `${WS_PROTOCOL}://${WS_HOST}/ws/notificaciones/?token=${token}`
      );

      ws.current.onopen = () => console.log('WS Notificaciones conectado');

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.tipo === 'nueva_tarea') {
          setNotifCount(prev => prev + 1);
          setToastNotif(data);
        }
      };

      ws.current.onerror = (e) => console.log('WS error:', e.message);
      ws.current.onclose = () => console.log('WS cerrado');
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch(`${API_URL}/buscar-cursos/?q=${query}`);
      const data = await res.json();
      navigation.navigate('ResultadosCursos', { cursos: data });
    } catch (error) {
      console.error(error);
    }
  };

  const handleToastPress = (notif) => {
    navigation.navigate('Mistareas', { tarea_id: notif.tarea_id });
  };

  const AvatarCircle = () => (
    <TouchableOpacity onPress={() => navigation.navigate(role === "docente" ? "Profile" : "Perfil")}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {user ? user.username.charAt(0).toUpperCase() : 'U'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.navWrapper}>
      <NotifToast
        notif={toastNotif}
        onClose={() => setToastNotif(null)}
        onPress={handleToastPress}
      />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput 
            placeholder="Buscar cursos..." 
            style={styles.input} 
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        <View style={styles.rightSection}>
          {role === 'estudiante' && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setNotifCount(0)}
            >
              <Ionicons name="notifications-outline" size={24} color="#374151" />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {role === "docente" ? (
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("CrearCurso")}>
              <Ionicons name="add-circle-outline" size={24} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Mistareas")}>
              <Ionicons name="clipboard-outline" size={24} color="#10B981" />
            </TouchableOpacity>
          )}

          <AvatarCircle />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  nav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#eee',
  },
  searchContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginHorizontal: 10,
    height: 40,
  },
  input: { marginLeft: 5, flex: 1, fontSize: 14 },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8, borderRadius: 6 },
  iconButton: { padding: 8, borderRadius: 6, marginRight: 8, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  avatar: { 
    width: 35, 
    height: 35, 
    borderRadius: 18, 
    backgroundColor: '#8B5CF6', 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { 
    width: 35, 
    height: 35, 
    borderRadius: 18,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});