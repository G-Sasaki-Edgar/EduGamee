import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import CourseCard from '../../components/common/CourseCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../constants/Config';

const getGradient = (color) => {
  const gradients = {
    '#4A90E2': ['#4A90E2', '#2563EB'],
    '#7C3AED': ['#7C3AED', '#4F46E5'],
    '#10B981': ['#10B981', '#059669'],
    '#F59E0B': ['#F59E0B', '#D97706'],
    '#EF4444': ['#EF4444', '#DC2626'],
    '#EC4899': ['#EC4899', '#DB2777'],
  };
  return gradients[color] ?? ['#4F46E5', '#7C3AED'];
};

export default function DocenteDashboard({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchCursos = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_URL}/mis-cursos-docente/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Error al cargar cursos');

          const data = await response.json();
          if (isActive) setCursos(data);
        } catch (err) {
          if (isActive) Alert.alert('Error', err.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchCursos();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Navbar role="docente" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mis Cursos</Text>
        <Text style={styles.subtitle}>Gestiona los cursos que has creado</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : cursos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No has creado cursos aún</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CrearCurso')}
            >
              <Text style={styles.createButtonText}>Crear mi primer curso</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.coursesContainer}>
            {cursos.map((curso) => (
              <CourseCard
                key={curso.codigo_acceso}
                level={curso.nivel ?? 1}
                xpAvailable={curso.xp_disponible ?? 0}
                title={curso.nombre}
                id={curso.codigo_acceso}
                subtitle={curso.descripcion || 'Sin descripción'}
                progress={curso.progreso ?? 0}
                gradientColors={getGradient(curso.color_tema)}
                onPress={() =>
                  navigation.navigate('DetalleCurso', {
                    cursoId: curso.codigo_acceso,
                  })
                }
              />
            ))}
          </View>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CrearCurso')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4F46E5" />
            <Text style={styles.actionText}>Crear Curso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TareasDocente')}
          >
            <Ionicons name="create-outline" size={24} color="#10B981" />
            <Text style={styles.actionText}>Gestionar Tareas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Alumnos')}
          >
            <Ionicons name="people-outline" size={24} color="#F59E0B" />
            <Text style={styles.actionText}>Ver Alumnos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textMain, marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  loader: { marginTop: 50 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, color: '#6B7280', marginTop: 16, marginBottom: 24, textAlign: 'center' },
  createButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  coursesContainer: { marginBottom: 30 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionCard: {
    flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12,
    alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#E5E7EB',
  },
  actionText: { fontSize: 12, color: '#374151', marginTop: 8, textAlign: 'center', fontWeight: '500' },
});