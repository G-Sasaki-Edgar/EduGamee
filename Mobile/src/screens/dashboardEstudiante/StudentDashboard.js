import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Navbar from '../../components/common/NavBar';
import CourseCard from '../../components/common/CourseCard'; 
import TaskItem from '../../components/common/TaskItem';
import { Colors, GlobalStyles } from '../../constants/theme'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  return gradients[color] ?? ['#06B6D4', '#3B82F6']; // fallback color estudiante
};

const StudentDashboard = ({ navigation }) => {
  const [cursos, setCursos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const [cursosRes, tareasRes] = await Promise.all([
          fetch(`${API_URL}/mis-cursos/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/mis-tareas/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!cursosRes.ok) throw new Error('Error al cargar cursos');
        if (!tareasRes.ok) throw new Error('Error al cargar tareas');

        const [cursosData, tareasData] = await Promise.all([
          cursosRes.json(),
          tareasRes.json(),
        ]);

        setCursos(cursosData);
        setTareas(tareasData);
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoadingCursos(false);
        setLoadingTareas(false);
      }
    };

    fetchData();
  }, []);

  const getDeadlineText = (fecha_entrega) => {
    const fecha = new Date(fecha_entrega);
    const diffDays = Math.ceil((fecha - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${diffDays} días`;
  };

  return (
    <View style={GlobalStyles.screenContainer}>
      <Navbar role="estudiante" />
      <ScrollView contentContainerStyle={GlobalStyles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Bienvenida */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.textMain }}>
            ¡Bienvenido de nuevo! 👋
          </Text>
          <Text style={{ color: Colors.textLight }}>Continúa tu camino de aprendizaje</Text>
        </View>

        {/* Mis Cursos */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={GlobalStyles.sectionTitle}>Mis Cursos</Text>
          <TouchableOpacity>
            <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: 'bold' }}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {loadingCursos ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : cursos.length === 0 ? (
          <Text style={{ color: Colors.textLight }}>No estás inscrito en ningún curso todavía.</Text>
        ) : (
          cursos.map(curso => (
            <CourseCard
              key={curso.id}
              id={curso.id}
              level={curso.nivel ?? 1}
              xpAvailable={curso.xp_disponible ?? 0}
              title={curso.nombre}
              subtitle={curso.descripcion || 'Sin descripción'}
              progress={curso.progreso ?? 0}
              gradientColors={getGradient(curso.color_tema)} // ← fix ✅
              onPress={() => navigation.navigate('Mistareas', { cursoId: curso.id })}
            />
          ))
        )}

        {/* Tareas Disponibles */}
        <Text style={GlobalStyles.sectionTitle}>Tareas Disponibles</Text>

        {loadingTareas ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : tareas.length === 0 ? (
          <Text style={{ color: Colors.textLight }}>No tienes tareas pendientes.</Text>
        ) : (
          tareas.map(tarea => (
            <TaskItem
              key={tarea.id}
              title={tarea.titulo}
              subtitle={tarea.curso.nombre}
              deadline={getDeadlineText(tarea.fecha_entrega)}
              color={tarea.curso.color_tema ?? '#06B6D4'} // ← color dinámico en tareas también ✅
            />
          ))
        )}

      </ScrollView>
    </View>
  );
};

export default StudentDashboard;