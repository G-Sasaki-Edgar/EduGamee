import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { API_URL } from '../../constants/Config';

export default function TareaFormScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [xpRecompensa, setXpRecompensa] = useState('10');
  const [fechaEntrega, setFechaEntrega] = useState('');

  const crearTarea = async () => {
    try {
      const response = await fetch(`${API_URL}/tareas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          instrucciones,
          xp_recompensa: parseInt(xpRecompensa),
          fecha_entrega: fechaEntrega,
          curso_id: 1 // ID del curso activo
        }),
      });

      if (response.ok) {
        alert('Tarea creada con éxito');
        navigation.goBack();
      } else {
        const data = await response.json();
        alert(data.detail || 'Error al crear tarea');
      }
    } catch (error) {
      console.error(error);
      alert('No se pudo conectar al servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Tarea</Text>
      <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
      <TextInput style={styles.input} placeholder="Instrucciones" value={instrucciones} onChangeText={setInstrucciones} multiline />
      <TextInput style={styles.input} placeholder="XP recompensa" value={xpRecompensa} onChangeText={setXpRecompensa} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Fecha entrega (ej: 2025-12-31T23:59:00Z)" value={fechaEntrega} onChangeText={setFechaEntrega} />
      <TouchableOpacity style={styles.button} onPress={crearTarea}>
        <Text style={styles.buttonText}>Guardar Tarea</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});