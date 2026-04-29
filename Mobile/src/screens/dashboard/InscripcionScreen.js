import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { API_URL } from '../../constants/Config';

export default function InscripcionScreen() {
  const [estudianteId, setEstudianteId] = useState('');
  const [cursoId, setCursoId] = useState('');

  const inscribirAlumno = async () => {
    if (!estudianteId || !cursoId) {
      Alert.alert('Campos incompletos', 'Debes ingresar el ID del estudiante y el ID del curso');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/inscripciones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudianteId.trim(),
          curso_id: cursoId.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Alumno inscrito con éxito');
        setEstudianteId('');
        setCursoId('');
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'No se pudo inscribir al alumno');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="ID Estudiante"
        value={estudianteId}
        onChangeText={setEstudianteId}
        style={styles.input}
      />
      <TextInput
        placeholder="ID del curso"
        value={cursoId}
        onChangeText={setCursoId}
        style={styles.input}
      />
      <Button title="Inscribir" onPress={inscribirAlumno} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
});
