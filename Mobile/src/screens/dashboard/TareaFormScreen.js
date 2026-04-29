import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';
import { useAuth } from '../../contexts/AuthContext';

export default function TareaFormScreen({ navigation }) {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [xpRecompensa, setXpRecompensa] = useState('10');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/cursos/`)
      .then(res => res.json())
      .then(data => {
        const misCursos = data.filter(c => c.docente?.id === user?.id);
        setCursos(misCursos);
      })
      .catch(err => console.error(err));
  }, []);

  const crearTarea = async () => {
    if (!titulo.trim()) return Alert.alert('Error', 'El título es obligatorio');
    if (!instrucciones.trim()) return Alert.alert('Error', 'Las instrucciones son obligatorias');
    if (!cursoSeleccionado) return Alert.alert('Error', 'Seleccioná un curso');
    if (!fechaEntrega.trim()) return Alert.alert('Error', 'La fecha de entrega es obligatoria');

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tareas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          instrucciones,
          xp_recompensa: parseInt(xpRecompensa) || 10,
          fecha_entrega: fechaEntrega,
          curso_id: cursoSeleccionado.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('¡Éxito!', 'Tarea creada correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.detail || 'No se pudo crear la tarea');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#7C3AED" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear Tarea</Text>
      <Text style={styles.subtitle}>Asigná una tarea a uno de tus cursos</Text>

      {/* Selector de curso */}
      <Text style={styles.label}>Curso *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {cursos.length === 0 ? (
          <Text style={{ color: '#9CA3AF', padding: 10 }}>No tenés cursos creados aún</Text>
        ) : (
          cursos.map(curso => (
            <TouchableOpacity
              key={curso.id}
              style={[styles.chip, cursoSeleccionado?.id === curso.id && styles.chipActive]}
              onPress={() => setCursoSeleccionado(curso)}
            >
              <Text style={[styles.chipText, cursoSeleccionado?.id === curso.id && styles.chipTextActive]}>
                {curso.nombre}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Título */}
      <Text style={styles.label}>Título *</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="create-outline" size={20} color="#9CA3AF" />
        <TextInput style={styles.input} placeholder="Ej: Ejercicios del capítulo 3" value={titulo} onChangeText={setTitulo} />
      </View>

      {/* Instrucciones */}
      <Text style={styles.label}>Instrucciones *</Text>
      <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
        <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Describe qué debe hacer el estudiante..." value={instrucciones} onChangeText={setInstrucciones} multiline />
      </View>

      {/* XP */}
      <Text style={styles.label}>XP de Recompensa</Text>
      <View style={styles.xpRow}>
        {['10', '25', '50', '100'].map(xp => (
          <TouchableOpacity
            key={xp}
            style={[styles.chip, xpRecompensa === xp && styles.chipActive]}
            onPress={() => setXpRecompensa(xp)}
          >
            <Text style={[styles.chipText, xpRecompensa === xp && styles.chipTextActive]}>{xp} XP</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fecha */}
      <Text style={styles.label}>Fecha de Entrega *</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
        <TextInput style={styles.input} placeholder="2025-12-31T23:59:00Z" value={fechaEntrega} onChangeText={setFechaEntrega} />
      </View>

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={crearTarea} disabled={loading}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Tarea'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: '#7C3AED', fontWeight: '600', marginLeft: 6 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 16, backgroundColor: '#F9FAFB',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', paddingVertical: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', marginRight: 8,
  },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { color: '#6B7280', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  xpRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 14,
    padding: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});