import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants/Config';

export default function Incribirse({ navigation }) {
  const { user } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnirse = async () => {
    if (!codigo.trim()) return Alert.alert('Error', 'Ingresá el código del curso');

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/Incribirse/`,
         {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_acceso: codigo,
          estudiante_id: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', data.detail);
        navigation.goBack();
      } else {
        Alert.alert('Error', data.detail);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#7C3AED" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Unirse a un Curso</Text>
      <Text style={styles.subtitle}>Ingresá el código que te dio tu docente</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={22} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder="Ej: MAT001"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleUnirse}
        disabled={loading}
      >
        <Ionicons name="enter-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>{loading ? 'Uniéndose...' : 'Unirse al Curso'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backText: { color: '#7C3AED', fontWeight: '600', marginLeft: 6 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 24, backgroundColor: '#F9FAFB', height: 54,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 18, fontWeight: '600', letterSpacing: 2 },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 14,
    padding: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});