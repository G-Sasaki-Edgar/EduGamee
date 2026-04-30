import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyles, Colors } from '../../constants/theme';

const CourseCard = ({ level, xpAvailable, title, subtitle, progress, gradientColors, id, onPress }) => {
  return (
    <View style={GlobalStyles.card}>
      {/* Cabecera con Degradado */}
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.levelText}>Lvl {level}</Text>
          {id && <Text style={styles.idText}>ID: {id}</Text>}
        </View>
        <Text style={styles.xpText}>+{xpAvailable} XP disponible</Text>
      </LinearGradient>

      {/* Contenido */}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Barra de Progreso */}
        
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: gradientColors[0],
              },
            ]}
          />
        </View>

        {/* Botón */}
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  levelText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  idText: { color: '#fff', fontSize: 12, opacity: 0.8, fontFamily: 'monospace' },
  xpText: { color: '#fff', fontSize: 12, opacity: 0.8 },
  body: { padding: 20 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain },
  subtitle: { fontSize: 12, color: Colors.textLight, marginBottom: 15 },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: { fontSize: 12, color: Colors.textLight },
  percentText: { fontSize: 12, color: Colors.textMain, fontWeight: 'bold' },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 15,
  },
  progressBarFill: { height: 8, borderRadius: 4 },
  button: {
    backgroundColor: Colors.inputBg,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: Colors.primary, fontWeight: '600' },
});

export default CourseCard;