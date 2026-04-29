import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, GlobalStyles } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import TaskItem from '../../components/common/TaskItem';
import { API_URL } from '../../constants/Config';

export default function Mistareas({ navigation, route }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tareaResaltada, setTareaResaltada] = useState(null);
  const scrollViewRef = useRef(null);
  const tareaRefs = useRef({});

  // Recibe tarea_id desde el toast
  useEffect(() => {
    if (route?.params?.tarea_id) {
      setTareaResaltada(route.params.tarea_id);
      // Quitar resaltado después de 3 segundos
      setTimeout(() => setTareaResaltada(null), 3000);
    }
  }, [route?.params?.tarea_id]);

  const fetchTareas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/mis-tareas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Error al cargar tareas");
      const data = await response.json();
      setTareas(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTareas();
    }, [])
  );

  // Scroll automático a la tarea resaltada
  useEffect(() => {
    if (tareaResaltada && tareaRefs.current[tareaResaltada]) {
      setTimeout(() => {
        tareaRefs.current[tareaResaltada]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 500);
    }
  }, [tareaResaltada, tareas]);

  const formatDeadline = (fechaEntrega) => {
    const fecha = new Date(fechaEntrega);
    const ahora = new Date();
    const diferencia = fecha - ahora;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    if (dias < 0) return "Vencida";
    if (dias === 0) return "Hoy";
    if (dias === 1) return "Mañana";
    return `${dias} días`;
  };

  const handleEntregarTarea = (tarea) => {
    navigation.navigate('EntregarTarea', { tarea });
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      <Navbar role="estudiante" />

      <ScrollView
        ref={scrollViewRef}
        style={GlobalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mis Tareas</Text>
        <Text style={styles.subtitle}>Tareas pendientes de tus cursos inscritos</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : tareas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No tienes tareas pendientes</Text>
            <Text style={styles.emptySubtext}>¡Excelente trabajo!</Text>
          </View>
        ) : (
          <View style={styles.tasksContainer}>
            {tareas.map((tarea) => {
              const esResaltada = tareaResaltada === tarea.id;
              return (
                <View
                  key={tarea.id}
                  ref={ref => tareaRefs.current[tarea.id] = ref}
                  style={[
                    styles.taskBlock,
                    esResaltada && styles.taskBlockResaltado
                  ]}
                >
                  {/* Badge "Nueva" cuando es la tarea notificada */}
                  {esResaltada && (
                    <View style={styles.nuevaBadge}>
                      <Ionicons name="notifications" size={12} color="#fff" />
                      <Text style={styles.nuevaBadgeText}>Nueva tarea</Text>
                    </View>
                  )}

                  <TaskItem
                    title={tarea.curso.nombre}
                    subtitle={tarea.titulo}
                    deadline={formatDeadline(tarea.fecha_entrega)}
                    color={esResaltada ? '#6366F1' : (tarea.curso.color_tema || Colors.primary)}
                    tarea={tarea}  // ← agregar esto
                  />

                  {!tarea.entregada ? (
                    <TouchableOpacity
                      style={[
                        styles.entregarButton,
                        esResaltada && styles.entregarButtonResaltado
                      ]}
                      onPress={() => handleEntregarTarea(tarea)}
                    >
                      <Ionicons name="send-outline" size={18} color="#fff" />
                      <Text style={styles.entregarButtonText}>Entregar tarea</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.entregadaContainer}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.entregadaText}>Tarea entregada</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  loader: { marginTop: 50 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tasksContainer: { marginTop: 10 },
  taskBlock: {
    marginBottom: 18,
    borderRadius: 12,
    padding: 4,
  },
  taskBlockResaltado: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 14,
    padding: 8,
  },
  nuevaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  nuevaBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  entregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  entregarButtonResaltado: {
    backgroundColor: '#6366F1',
  },
  entregarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  entregadaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  entregadaText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});