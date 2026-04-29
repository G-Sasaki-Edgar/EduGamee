import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  ActivityIndicator, Image, Alert, TouchableOpacity, Dimensions
} from 'react-native';
import Navbar from '../../components/common/NavBar';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useApi } from '../../hooks/useApi';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Calcula nivel y XP necesaria para el siguiente nivel
// Cada nivel requiere nivel * 100 XP (nivel 1 = 100xp, nivel 2 = 200xp, etc.)
const calcularProgreso = (xp_total, nivel_actual) => {
  const xpParaSiguiente = nivel_actual * 100;
  const xpEnNivelActual = xp_total % xpParaSiguiente;
  const porcentaje = Math.min((xpEnNivelActual / xpParaSiguiente) * 100, 100);
  const faltante = xpParaSiguiente - xpEnNivelActual;
  return { porcentaje, faltante, xpParaSiguiente };
};

const getNivelLabel = (nivel) => {
  if (nivel <= 2) return { label: 'Novato', color: '#6B7280', bg: '#F3F4F6' };
  if (nivel <= 5) return { label: 'Aprendiz', color: '#2563EB', bg: '#DBEAFE' };
  if (nivel <= 10) return { label: 'Explorador', color: '#7C3AED', bg: '#EDE9FE' };
  if (nivel <= 20) return { label: 'Experto', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Maestro', color: '#DC2626', bg: '#FEE2E2' };
};

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const PerfilUsuario = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { apiRequest } = useApi();
  const [userProfile, setUserProfile] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      obtenerPerfil();
    }, [])
  );

  const obtenerPerfil = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/perfil/');
      setUserProfile(data);
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      Alert.alert('Error', 'No se pudo sincronizar el perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('¿Estás seguro que querés cerrar sesión?');
    if (confirmed) {
      await logout();
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  if (isLoading && !userProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

    const { usuario, rol, xp_total = 0, nivel_actual = 1 } = userProfile || {};
    const avatar = { uri: 'https://edugamefy-media.s3.us-east-1.amazonaws.com/avatares/Docente.jpg' };

  const { porcentaje, faltante } = calcularProgreso(xp_total, nivel_actual);
  const nivelInfo = getNivelLabel(nivel_actual);
  const iniciales = usuario?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar role="docente" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          {/* Avatar */}
          <View style={styles.avatarRing}>
            {avatar ? (
              <Image source={avatar} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{iniciales}</Text>
              </View>
            )}
            {/* Badge de nivel */}
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>{nivel_actual}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{usuario?.username || 'Usuario'}</Text>

          {/* Badge de rango */}
          <View style={[styles.rankBadge, { backgroundColor: nivelInfo.bg }]}>
            <Ionicons name="shield-checkmark" size={13} color={nivelInfo.color} />
            <Text style={[styles.rankText, { color: nivelInfo.color }]}>{nivelInfo.label}</Text>
          </View>

          {/* Rol */}
          <Text style={styles.rolText}>{rol === 'docente' ? '👨‍🏫 Docente' : '🎓 Estudiante'}</Text>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard icon="flash" label="XP Total" value={xp_total} color="#6366F1" />
          <StatCard icon="trophy" label="Nivel" value={`Nv. ${nivel_actual}`} color="#F59E0B" />
          <StatCard icon="trending-up" label="Rango" value={nivelInfo.label} color="#10B981" />
        </View>

        {/* ── Barra de XP ── */}
        <View style={styles.section}>
          <View style={styles.xpHeader}>
            <Text style={styles.sectionTitle}>Progreso de nivel</Text>
            <Text style={styles.xpMeta}>{xp_total} XP</Text>
          </View>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${porcentaje}%` }]} />
          </View>

          <View style={styles.xpFooter}>
            <Text style={styles.xpHint}>Nivel {nivel_actual}</Text>
            <Text style={styles.xpHint}>Faltan {faltante} XP → Nivel {nivel_actual + 1}</Text>
          </View>
        </View>

        {/* ── Info Personal ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <View style={styles.infoCard}>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="person-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>
                  {usuario?.first_name
                    ? `${usuario.first_name} ${usuario.last_name || ''}`.trim()
                    : 'Sin nombre'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{usuario?.email || 'No disponible'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="at-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre de usuario</Text>
                <Text style={styles.infoValue}>@{usuario?.username || '—'}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* ── Cerrar Sesión ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  loadingText: {
    marginTop: 12,
    color: '#6366F1',
    fontSize: 14,
  },
  scrollContainer: {
    paddingBottom: 48,
  },

  // Hero
  hero: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },
  avatarRing: {
    position: 'relative',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: '#6366F1',
    padding: 3,
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 1,
  },
  levelCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1B4B',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rolText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Sección genérica
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Barra XP
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpMeta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  barTrack: {
    height: 10,
    backgroundColor: '#E0E7FF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 6,
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xpHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 3,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1E1B4B',
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },

  // Logout
  logoutBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PerfilUsuario;
