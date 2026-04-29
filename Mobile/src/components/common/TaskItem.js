import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

const TaskItem = ({ title, subtitle, deadline, color, tarea }) => {
  // Si llega el objeto tarea completo úsalo, si no usa title/subtitle legacy
  const cursoNombre = tarea?.curso?.nombre || title;
  const tareaTitulo = tarea?.titulo || subtitle;
  const docenteNombre = tarea?.curso?.docente?.first_name
    ? `${tarea.curso.docente.first_name} ${tarea.curso.docente.last_name || ''}`.trim()
    : tarea?.curso?.docente?.username || '';

  return (
    <View style={styles.container}>
      {/* Línea lateral de color */}
      <View style={[styles.statusLine, { backgroundColor: color }]} />

      <View style={styles.content}>

        {/* Curso */}
        <View style={styles.row}>
          <View style={[styles.cursoBadge, { backgroundColor: color + '20' }]}>
            <Ionicons name="book-outline" size={11} color={color} />
            <Text style={[styles.cursoText, { color }]} numberOfLines={1}>
              {cursoNombre}
            </Text>
          </View>
        </View>

        {/* Título de la tarea */}
        <Text style={styles.tareaTitulo} numberOfLines={2}>
          {tareaTitulo}
        </Text>

        {/* Docente y fecha */}
        <View style={styles.footer}>
          {docenteNombre ? (
            <View style={styles.docenteRow}>
              <Ionicons name="person-outline" size={11} color="#9CA3AF" />
              <Text style={styles.docenteText} numberOfLines={1}>
                {docenteNombre}
              </Text>
            </View>
          ) : null}

          <View style={styles.deadlineRow}>
            <Ionicons name="time-outline" size={11} color={Colors.orange} />
            <Text style={styles.deadlineText}>
              Vence en {deadline}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLine: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    minHeight: 60,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  cursoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tareaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  docenteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  docenteText: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.orange,
  },
});

export default TaskItem;