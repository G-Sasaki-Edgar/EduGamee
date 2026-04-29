import React, { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, GlobalStyles } from '../../constants/theme';
import Navbar from '../../components/common/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../constants/Config';


export default function Logros({ navigation }) {
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLogros = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await fetch(`${API_URL}/logros/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Error al cargar logros");
          const data = await response.json();
          setLogros(data);
        } catch (err) {
          Alert.alert("Error", err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLogros();
    }, [])
  );

  const renderLogro = (logro) => (
    <View
      key={logro.id}
      style={[styles.logroCard, !logro.obtenido && styles.logroCardBloqueado]}
    >
      {/* Ícono */}
      <View style={[
          styles.iconContainer,
          logro.obtenido ? styles.iconDesbloqueado : styles.iconBloqueado
        ]}>
          {logro.obtenido ? (
            <Image
              source={{ uri: logro.icono_url }}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="lock-closed" size={36} color="#9CA3AF" />
          )}
        </View>

      {/* Contenido */}
      <View style={styles.logroContent}>
        <View style={styles.logroHeader}>
          <Text style={[
            styles.logroTitle,
            !logro.obtenido && styles.textoGris
          ]}>
            {logro.nombre}
          </Text>
          {logro.obtenido && (
            <View style={styles.badgeObtenido}>
              <Text style={styles.badgeText}>✓ Obtenido</Text>
            </View>
          )}
        </View>

        <Text style={[styles.logroDescription, !logro.obtenido && styles.textoGris]}>
          {logro.descripcion}
        </Text>

        <View style={styles.logroFooter}>
          <Text style={[styles.logroXp, !logro.obtenido && styles.textoGrisXp]}>
            🏅 {logro.xp_requerida} XP requerida
          </Text>
          {logro.obtenido && logro.obtenido_en && (
            <Text style={styles.fechaObtenido}>
              📅 {logro.obtenido_en}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // Separar logros obtenidos y bloqueados
  const obtenidos = logros.filter(l => l.obtenido);
  const bloqueados = logros.filter(l => !l.obtenido);

  return (
    <View style={GlobalStyles.screenContainer}>
      <Navbar role="estudiante" />
      <ScrollView style={GlobalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.sectionTitle}>Mis Logros</Text>
        <Text style={styles.subtitle}>Tus conquistas y reconocimientos</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : logros.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>Aún no hay logros configurados</Text>
          </View>
        ) : (
          <View>
            {/* Contador resumen */}
            <View style={styles.resumen}>
              <Text style={styles.resumenTexto}>
                🏆 {obtenidos.length} de {logros.length} logros obtenidos
              </Text>
            </View>

            {/* Logros obtenidos */}
            {obtenidos.length > 0 && (
              <>
                <Text style={styles.seccionTitulo}>✅ Desbloqueados</Text>
                {obtenidos.map(renderLogro)}
              </>
            )}

            {/* Logros bloqueados */}
            {bloqueados.length > 0 && (
              <>
                <Text style={styles.seccionTitulo}>🔒 Por desbloquear</Text>
                {bloqueados.map(renderLogro)}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: { marginTop: 50 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginTop: 20,
  },
  resumen: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  resumenTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 10,
    marginTop: 4,
  },
  logroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logroCardBloqueado: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconDesbloqueado: {
    backgroundColor: Colors.primary + '20',
  },
  iconBloqueado: {
    backgroundColor: '#E5E7EB',
  },
  logroContent: { flex: 1 },
  logroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textMain,
    flex: 1,
  },
  textoGris: { color: '#9CA3AF' },
  badgeObtenido: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  logroDescription: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  logroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logroXp: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  textoGrisXp: { color: '#9CA3AF' },
  fechaObtenido: {
    fontSize: 11,
    color: '#6B7280',
  },
});