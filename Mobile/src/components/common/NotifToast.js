import React, { useEffect, useRef } from 'react';
import {
  Animated, TouchableOpacity, Text, View, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotifToast({ notif, onClose, onPress }) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!notif) return;

    // Entra desde arriba
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Se va solo a los 4 segundos
    const timer = setTimeout(() => {
      salir();
    }, 4000);

    return () => clearTimeout(timer);
  }, [notif]);

  const salir = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!notif) return null;

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY }], opacity }
    ]}>
      {/* Ícono */}
      <View style={styles.iconBox}>
        <Ionicons name="clipboard" size={22} color="#fff" />
      </View>

      {/* Texto */}
      <View style={styles.textBox}>
        <Text style={styles.titulo}>📚 Nueva tarea</Text>
        <Text style={styles.mensaje} numberOfLines={1}>{notif.mensaje}</Text>
        <Text style={styles.curso} numberOfLines={1}>📖 {notif.curso}</Text>
      </View>

      {/* Botón ver tarea */}
      <TouchableOpacity style={styles.verBtn} onPress={() => { onPress(notif); salir(); }}>
        <Text style={styles.verText}>Ver</Text>
        <Ionicons name="arrow-forward" size={14} color="#6366F1" />
      </TouchableOpacity>

      {/* Cerrar */}
      <TouchableOpacity onPress={salir} style={styles.closeBtn}>
        <Ionicons name="close" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textBox: {
    flex: 1,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  mensaje: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  curso: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  verBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  verText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  closeBtn: {
    padding: 4,
  },
});