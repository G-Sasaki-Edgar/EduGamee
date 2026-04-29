import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, GlobalStyles } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import { API_URL } from '../../constants/Config';

export default function EntregarTarea({ route, navigation }) {
  const { tarea } = route.params || {};
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!tarea) {
      Alert.alert('Error', 'No se encontró la tarea.');
      return;
    }

    if (!contenido.trim()) {
      Alert.alert('Error', 'Agrega una descripción antes de entregar.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No se encontró token de usuario.');
      if (!user) throw new Error('No se encontraron datos del usuario.');

      const response = await fetch(`${API_URL}/entregar-tarea/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        tarea_id: tarea.id,
        contenido,           // ✅ sin estudiante_id
      }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.detail || 'No se pudo entregar la tarea.';
        throw new Error(message);
      }

      Alert.alert('¡Entrega enviada!', 'Tu tarea se registró correctamente.', [
        { text: 'OK', onPress: () => {
          navigation.goBack();
          navigation.navigate('Mistareas');
        }},
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      <Navbar role="estudiante" />
      <ScrollView style={GlobalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Entregar Tarea</Text>

        {tarea ? (
          <View style={styles.card}>
            <Text style={styles.courseTitle}>{tarea.curso.nombre}</Text>
            <Text style={styles.taskTitle}>{tarea.titulo}</Text>
            <Text style={styles.teacherText}>
              Docente: {tarea.curso.docente.first_name || tarea.curso.docente.username}
            </Text>
            <Text style={styles.instructionsLabel}>Instrucciones:</Text>
            <Text style={styles.instructionsText}>{tarea.instrucciones}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No se encontró información de la tarea.</Text>
          </View>
        )}

        <Text style={styles.label}>Descripción de la entrega</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Escribe aquí cómo resolviste la tarea..."
          value={contenido}
          onChangeText={setContenido}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Enviar entrega</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 6,
  },
  teacherText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMain,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});