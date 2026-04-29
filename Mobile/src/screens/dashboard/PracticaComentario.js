import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../../constants/Config';

const PracticaComentario = () => {
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // REEMPLAZA ESTA IP por la de tu PC (usa ipconfig en la terminal)

  const enviarDatos = async () => {
    if (!mensaje.trim()) return Alert.alert("Error", "Escribe algo primero");

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/comentarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tarea: 1, // Asegúrate de que exista una tarea con ID 1 en tu DB
          autor: 1, // Asegúrate de que exista un usuario con ID 1
          mensaje: mensaje
        }),
      });

      const resultado = await response.json();

      if (response.ok) {
        Alert.alert("¡Éxito!", "Comentario guardado en la DB");
        setMensaje('');
      } else {
        console.log("Error del servidor:", resultado);
        Alert.alert("Error", "No se pudo guardar");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de red", "Verifica que el backend esté corriendo y la IP sea correcta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Práctica: Enviar Comentario</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        value={mensaje}
        onChangeText={setMensaje}
      />
      <Button 
        title={cargando ? "Enviando..." : "Enviar a Django"} 
        onPress={enviarDatos} 
        disabled={cargando}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 50, flex: 1, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10, fontSize: 16 }
});

export default PracticaComentario;