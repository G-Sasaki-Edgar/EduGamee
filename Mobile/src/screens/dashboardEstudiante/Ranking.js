import React, { useState, useEffect } from 'react';
import {
  View, Text, ActivityIndicator, StyleSheet,
  FlatList, SafeAreaView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import { API_URL } from '../../constants/Config';

const PODIUM_COLORS = {
  1: { bg: '#FFF8E1', border: '#FFD700', text: '#B8860B', icon: 'trophy' },
  2: { bg: '#F5F5F5', border: '#9E9E9E', text: '#616161', icon: 'medal' },
  3: { bg: '#FBE9E7', border: '#FF8A65', text: '#BF360C', icon: 'medal' },
};

const getNivelLabel = (nivel) => {
  if (nivel <= 2) return 'Novato';
  if (nivel <= 5) return 'Aprendiz';
  if (nivel <= 10) return 'Explorador';
  if (nivel <= 20) return 'Experto';
  return 'Maestro';
};

const getInitials = (nombre) =>
  nombre?.slice(0, 2).toUpperCase() || '??';

const AVATAR_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B',
  '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'
];

const getAvatarColor = (nombre) => {
  const idx = (nombre?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// Tarjeta del TOP 3
const PodiumCard = ({ item }) => {
const theme = PODIUM_COLORS[item.posicion] || PODIUM_COLORS[1];
  const xpProgress = Math.min(((item.xp_total % 100) / 100) * 100, 100);

  return (
    <View style={[styles.podiumCard, { borderColor: theme.border, backgroundColor: theme.bg }]}>
      <View style={styles.podiumLeft}>
        {/* Avatar */}
        <View style={[styles.podiumAvatar, { backgroundColor: getAvatarColor(item.nombre_jugador) }]}>
          <Text style={styles.podiumAvatarText}>{getInitials(item.nombre_jugador)}</Text>
        </View>
        {/* Posición */}
        <View style={[styles.posBadge, { backgroundColor: theme.border }]}>
          <Text style={styles.posBadgeText}>#{item.posicion}</Text>
        </View>
      </View>

      <View style={styles.podiumInfo}>
        <Text style={styles.podiumNombre} numberOfLines={1}>{item.nombre_jugador}</Text>
        <Text style={styles.podiumNivel}>
          Nv. {item.nivel_actual} · {getNivelLabel(item.nivel_actual)}
        </Text>

        {/* Barra XP */}
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, {
            width: `${xpProgress}%`,
            backgroundColor: theme.border
          }]} />
        </View>
      </View>

      <View style={styles.podiumXP}>
        <Ionicons name="flash" size={14} color={theme.text} />
        <Text style={[styles.podiumXPText, { color: theme.text }]}>{item.xp_total}</Text>
        <Text style={[styles.podiumXPLabel, { color: theme.text }]}>XP</Text>
      </View>
    </View>
  );
};

// Fila normal del ranking
const RankingRow = ({ item, index }) => {
  const xpProgress = Math.min(((item.xp_total % 100) / 100) * 100, 100);
  const avatarColor = getAvatarColor(item.nombre_jugador);

  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankPos}>#{item.posicion}</Text>

      <View style={[styles.rowAvatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.rowAvatarText}>{getInitials(item.nombre_jugador)}</Text>
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowNombre} numberOfLines={1}>{item.nombre_jugador}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.rowNivel}>Nv. {item.nivel_actual}</Text>
          <View style={styles.xpBarBgSm}>
            <View style={[styles.xpBarFillSm, { width: `${xpProgress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.rowXP}>
        <Text style={styles.rowXPText}>{item.xp_total}</Text>
        <Text style={styles.rowXPLabel}>XP</Text>
      </View>
    </View>
  );
};

export default function RankingScreen() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/ranking/`);
    if (!response.ok) throw new Error('Error al obtener el ranking');
    const data = await response.json();
    
    // Filtrar estudiantes y reasignar posiciones correctamente
    const soloEstudiantes = data
      .filter(u => u.rol === 'estudiante')
      .map((u, index) => ({ ...u, posicion: index + 1 }));
    
    setRanking(soloEstudiantes);
    setError('');
  } catch (err) {
    setError('No se pudo cargar el ranking');
  } finally {
    setLoading(false);
  }
};

  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar role="estudiante" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando ranking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar role="estudiante" />
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar role="estudiante" />
      <FlatList
        data={resto}
        keyExtractor={(item, index) => `${item.nombre_jugador}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.headerTitle}>Ranking</Text>
              <Text style={styles.headerSub}>{ranking.length} estudiantes</Text>
            </View>

            {/* Podio TOP 3 */}
            {top3.length > 0 && (
              <View style={styles.podiumSection}>
                <Text style={styles.sectionLabel}>🏆 TOP 3</Text>
                {top3.map(item => (
                  <PodiumCard key={item.nombre_jugador} item={item} />
                ))}
              </View>
            )}

            {/* Resto */}
            {resto.length > 0 && (
              <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
                📋 Clasificación general
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => <RankingRow item={item} />}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Ionicons name="people-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hay estudiantes aún</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, color: '#6366F1', fontSize: 14 },
  errorText: { marginTop: 12, color: '#EF4444', fontSize: 15, textAlign: 'center' },
  emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 15 },
  listContent: { paddingBottom: 32 },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  trophyCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E1B4B' },
  headerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  // Sección labels
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#6B7280',
    paddingHorizontal: 16, marginBottom: 10,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Podio
  podiumSection: { paddingHorizontal: 16, marginBottom: 8 },
  podiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  podiumLeft: { position: 'relative' },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  podiumAvatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  posBadge: {
    position: 'absolute', bottom: -4, right: -4,
    borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 2, borderColor: '#fff',
  },
  posBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  podiumInfo: { flex: 1 },
  podiumNombre: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginBottom: 3 },
  podiumNivel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  xpBarBg: {
    height: 6, backgroundColor: '#E5E7EB',
    borderRadius: 3, overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: 3 },
  podiumXP: { alignItems: 'center', gap: 2 },
  podiumXPText: { fontSize: 18, fontWeight: '800' },
  podiumXPLabel: { fontSize: 10, fontWeight: '600' },

  // Filas normales
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankPos: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', width: 28 },
  rowAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  rowAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowInfo: { flex: 1 },
  rowNombre: { fontSize: 14, fontWeight: '600', color: '#1E1B4B', marginBottom: 4 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowNivel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  xpBarBgSm: {
    flex: 1, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, overflow: 'hidden',
  },
  xpBarFillSm: { height: '100%', backgroundColor: '#6366F1', borderRadius: 2 },
  rowXP: { alignItems: 'flex-end' },
  rowXPText: { fontSize: 15, fontWeight: '800', color: '#6366F1' },
  rowXPLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
});