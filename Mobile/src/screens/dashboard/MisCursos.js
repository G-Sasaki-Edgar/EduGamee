import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../constants/Config';

export default function MisCursos({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const eliminarCurso = async (cursoId) => {
  Alert.alert(
    'Eliminar Curso',
    '¿Estás seguro que querés eliminar este curso? Esta acción no se puede deshacer.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursos/${cursoId}/`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al eliminar');
            setCursos(prev => prev.filter(c => c.id !== cursoId));
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar el curso');
          }
        }
      }
    ]
  );
};
  useFocusEffect(
    React.useCallback(() => {
      const fetchCursosConTareas = async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const response = await fetch(`${API_URL}/mis-cursos-con-tareas/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!response.ok) throw new Error("Error al cargar cursos");

          const data = await response.json();
          setCursos(data);
        } catch (err) {
          Alert.alert("Error", err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchCursosConTareas();
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderTareaItem = (tarea) => (
    <View key={tarea.id} style={styles.tareaItem}>
      <View style={styles.tareaHeader}>
        <Ionicons name="document-text-outline" size={20} color="#4F46E5" />
        <Text style={styles.tareaTitle}>{tarea.titulo}</Text>
      </View>
      <View style={styles.tareaDetails}>
        <View style={styles.tareaInfo}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.tareaDate}>{formatDate(tarea.fecha_entrega)}</Text>
        </View>
        <View style={styles.tareaInfo}>
          <Ionicons name="star-outline" size={16} color="#F59E0B" />
          <Text style={styles.tareaXP}>{tarea.xp_recompensa} XP</Text>
        </View>
      </View>
    </View>
  );

  const renderCursoItem = (curso) => (
    <View key={curso.id} style={styles.cursoCard}>
      <View style={styles.cursoHeader}>
        <View style={styles.cursoTitleContainer}>
          <Ionicons name="book-outline" size={24} color="#4F46E5" />
          <View style={styles.cursoTextContainer}>
            <Text style={styles.cursoTitle}>{curso.nombre}</Text>
            <Text style={styles.cursoCode}>Código: {curso.codigo_acceso}</Text>
          </View>
        </View>
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => navigation.navigate('TareasDocente', { cursoId: curso.id })}
          >
            <Ionicons name="add-circle-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => eliminarCurso(curso.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
      </View>

      {curso.descripcion && (
        <Text style={styles.cursoDescription}>{curso.descripcion}</Text>
      )}

      <Text style={styles.tareasTitle}>
        Tareas ({curso.tareas.length})
      </Text>

      {curso.tareas.length === 0 ? (
        <View style={styles.emptyTareas}>
          <Ionicons name="document-outline" size={32} color="#9CA3AF" />
          <Text style={styles.emptyTareasText}>No hay tareas creadas</Text>
          <TouchableOpacity
            style={styles.createFirstTaskButton}
            onPress={() => navigation.navigate('TareasDocente', { cursoId: curso.id })}
          >
            <Text style={styles.createFirstTaskText}>Crear primera tarea</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tareasContainer}>
          {curso.tareas.map(renderTareaItem)}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar role="docente" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mis Cursos</Text>
        <Text style={styles.subtitle}>Gestiona tus cursos y sus tareas</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : cursos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No has creado cursos aún</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CrearCurso')}
            >
              <Text style={styles.createButtonText}>Crear mi primer curso</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cursosContainer}>
            {cursos.map(renderCursoItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cursosContainer: {
    gap: 20,
  },
  cursoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cursoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cursoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cursoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  cursoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cursoCode: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addTaskButton: {
    padding: 8,
  },
  cursoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  tareasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyTareas: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTareasText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 16,
  },
  createFirstTaskButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createFirstTaskText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  tareasContainer: {
    gap: 12,
  },
  tareaItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  tareaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tareaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  tareaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tareaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tareaDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tareaXP: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 4,
  },
});