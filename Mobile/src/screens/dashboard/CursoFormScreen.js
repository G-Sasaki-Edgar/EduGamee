import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';

const COLORES = ['#4A90E2', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function CursoFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [colorTema, setColorTema] = useState('#4A90E2');
  const [loading, setLoading] = useState(false);

  const crearCurso = async () => {
    if (!nombre.trim()) return alert('El nombre es obligatorio');

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);

      // Generar código de acceso único
      const codigoAcceso = Math.random().toString(36).substring(2, 8).toUpperCase();

      const response = await fetch(`${API_URL}/cursos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          color_tema: colorTema,
          codigo_acceso: codigoAcceso,
          docente_id: user.id
        }),
      });

      if (response.ok) {
        alert(`Curso creado con éxito!\nCódigo de acceso: ${codigoAcceso}`);
        navigation.goBack();
      } else {
        const data = await response.json();
        alert(data.detail || 'Error al crear curso');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#7C3AED" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear Curso</Text>
      <Text style={styles.subtitle}>Completa la información del nuevo curso</Text>

      {/* Nombre */}
      <Text style={styles.label}>Nombre del curso *</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder="Ej: Matemáticas Básicas"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      {/* Descripción */}
      <Text style={styles.label}>Descripción</Text>
      <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
        <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Describe de qué trata el curso..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
      </View>

      {/* Color */}
      <Text style={styles.label}>Color del curso</Text>
      <View style={styles.coloresRow}>
        {COLORES.map(color => (
          <TouchableOpacity
            key={color}
            style={[styles.colorCircle, { backgroundColor: color }, colorTema === color && styles.colorSelected]}
            onPress={() => setColorTema(color)}
          >
            {colorTema === color && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview */}
      <View style={[styles.preview, { backgroundColor: colorTema }]}>
        <Ionicons name="book" size={28} color="#fff" />
        <Text style={styles.previewText}>{nombre || 'Nombre del curso'}</Text>
        <Text style={styles.previewSub}>{descripcion || 'Descripción del curso'}</Text>
      </View>

      {/* Botón */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={crearCurso}
        disabled={loading}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Curso'}</Text>
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
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 16, backgroundColor: '#F9FAFB',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', paddingVertical: 12 },
  coloresRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  colorCircle: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  colorSelected: { borderWidth: 3, borderColor: '#111827' },
  preview: {
    borderRadius: 16, padding: 20,
    marginBottom: 24, alignItems: 'center',
  },
  previewText: { color: '#fff', fontWeight: '700', fontSize: 18, marginTop: 8 },
  previewSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, textAlign: 'center' },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 14,
    padding: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});