import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';
import { useAuth } from '../../contexts/AuthContext';

const ESTADOS = ['pendiente', 'completada', 'atrasada'];
const COLORES = {
  pendiente: '#F59E0B',
  completada: '#10B981',
  atrasada: '#EF4444',
};

export default function RevisionDocente({ navigation }) {
  const { token } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [xpGanada, setXpGanada] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarEntregas();
  }, []);

  const cargarEntregas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/entregas-docente/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setEntregas(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  const actualizarEntrega = async () => {
    if (!nuevoEstado) return Alert.alert('Error', 'Seleccioná un estado');

    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/calificar-entrega/${entregaSeleccionada.id}/`, { // ✅ cambio aquí
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          xp_ganada: parseInt(xpGanada) || 0,
        }),
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', `Entrega calificada. +${xpGanada} XP al estudiante`);
        setEntregaSeleccionada(null);
        cargarEntregas();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'No se pudo actualizar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setGuardando(false);
    }
  };
  const entregasFiltradas = filtro === 'todos'
    ? entregas
    : entregas.filter(e => e.estado === filtro);

  // Vista detalle
  if (entregaSeleccionada) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setEntregaSeleccionada(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Revisar Entrega</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={20} color="#7C3AED" />
            <Text style={styles.cardLabel}>Estudiante</Text>
          </View>
          <Text style={styles.cardValue}>{entregaSeleccionada.estudiante?.username}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="document-text-outline" size={20} color="#7C3AED" />
            <Text style={styles.cardLabel}>Tarea</Text>
          </View>
          <Text style={styles.cardValue}>{entregaSeleccionada.tarea?.titulo}</Text>
          <Text style={styles.cardSub}>📚 {entregaSeleccionada.tarea?.curso?.nombre}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="chatbox-outline" size={20} color="#7C3AED" />
            <Text style={styles.cardLabel}>Respuesta del estudiante</Text>
          </View>
          <Text style={styles.cardValue}>
            {entregaSeleccionada.contenido || 'Sin contenido enviado'}
          </Text>
        </View>

        <Text style={styles.label}>Cambiar Estado</Text>
        <View style={styles.estadoRow}>
          {ESTADOS.map(estado => (
            <TouchableOpacity
              key={estado}
              style={[styles.estadoChip, nuevoEstado === estado && { backgroundColor: COLORES[estado] }]}
              onPress={() => setNuevoEstado(estado)}
            >
              <Text style={[styles.estadoChipText, nuevoEstado === estado && { color: '#fff' }]}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>XP a otorgar</Text>
        <View style={styles.xpRow}>
          {['0', '10', '25', '50', '100'].map(xp => (
            <TouchableOpacity
              key={xp}
              style={[styles.xpChip, xpGanada === xp && styles.xpChipActive]}
              onPress={() => setXpGanada(xp)}
            >
              <Text style={[styles.xpChipText, xpGanada === xp && styles.xpChipTextActive]}>
                {xp} XP
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, guardando && { opacity: 0.7 }]}
          onPress={actualizarEntrega}
          disabled={guardando}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar Revisión'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Vista lista
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Revisión de Entregas</Text>
        <Text style={styles.subtitle}>{entregasFiltradas.length} entregas</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {['todos', ...ESTADOS].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.filtroChipText, filtro === f && styles.filtroChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entregasFiltradas}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay entregas</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.entregaCard}
              onPress={() => {
                setEntregaSeleccionada(item);
                setNuevoEstado(item.estado);
                setXpGanada(item.xp_ganada.toString());
              }}
            >
              <View style={styles.entregaHeader}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>
                    {item.estudiante?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entregaEstudiante}>{item.estudiante?.username}</Text>
                  <Text style={styles.entregaTarea}>{item.tarea?.titulo}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: COLORES[item.estado] + '20' }]}>
                  <Text style={[styles.estadoBadgeText, { color: COLORES[item.estado] }]}>
                    {item.estado}
                  </Text>
                </View>
              </View>
              <View style={styles.entregaFooter}>
                <Text style={styles.entregaCurso}>📚 {item.tarea?.curso?.nombre}</Text>
                <Text style={styles.entregaXp}>⭐ {item.xp_ganada} XP</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { color: '#7C3AED', fontWeight: '600', marginLeft: 6 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontWeight: '600', color: '#7C3AED', marginLeft: 8 },
  cardValue: { fontSize: 16, color: '#111827', fontWeight: '500' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  estadoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  estadoChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  estadoChipText: { color: '#6B7280', fontWeight: '600' },
  xpRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  xpChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  xpChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  xpChipText: { color: '#6B7280', fontWeight: '600' },
  xpChipTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 14,
    padding: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 40,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  filtroChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', marginRight: 8,
  },
  filtroChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filtroChipText: { color: '#6B7280', fontWeight: '600' },
  filtroChipTextActive: { color: '#fff' },
  entregaCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  entregaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarSmall: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  entregaEstudiante: { fontWeight: '700', fontSize: 15, color: '#111827' },
  entregaTarea: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoBadgeText: { fontSize: 12, fontWeight: '700' },
  entregaFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  entregaCurso: { fontSize: 13, color: '#6B7280' },
  entregaXp: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9CA3AF', fontSize: 16, marginTop: 12 },
});