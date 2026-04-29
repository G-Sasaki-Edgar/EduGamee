import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, GraduationCap, Users, Eye, Sparkles } from 'lucide-react-native';
import { GlobalStyles, Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useFocusEffect } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {
  const [screen, setScreen] = useState('login');
  const [role, setRole] = useState('estudiante');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { apiRequest } = useApi();

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setNombre('');
      setError('');
      setScreen('login');
    }, [])
  );

const handleLogin = async () => {
 console.log('Enviando:', { email, password }); // ✅ agregar esto
  try {
    const data = await apiRequest('/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);// Login público, no token necesario

    const userData = {
      id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      role: data.role,
      xp_total: data.xp_total,
      nivel_actual: data.nivel_actual,
      avatar: data.avatar,
    };
    await login(userData, data.access);

    if (data.role === 'estudiante') {
      navigation.replace('MainEstudiante');
    } else if (data.role === 'docente') {
      navigation.replace('MainDocente');
    } else {
      setError('Rol desconocido');
    }
  } catch (error) {
    setError(error.message);
  }
};




  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !nombre.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const data = await apiRequest('/registro/', {
        method: 'POST',
        body: JSON.stringify({
          username: email,   // puedes usar el email como username
          email,
          password,
          role,
          first_name: nombre
        }),
      }, false); // requireToken: false para registro público

      setError("");
      // Después del registro exitoso, hacer login automáticamente para obtener el token
      const loginData = await apiRequest('/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false); // Login público tras registro

      const userData = {
        id: loginData.id,
        username: loginData.username,
        email: loginData.email,
        first_name: loginData.first_name,
        role: loginData.role,
        xp_total: loginData.xp_total,
        nivel_actual: loginData.nivel_actual,
        avatar: loginData.avatar,
      };
      await login(userData, loginData.access);

      // Navegar al dashboard correspondiente
      if (loginData.role === "estudiante") {
        navigation.replace("MainEstudiante");
      } else if (loginData.role === "docente") {
        navigation.replace("MainDocente");
      } else {
        setError("Rol desconocido");
      }
    } catch (err) {
      console.error('Error de registro:', err);
      setError(err.message || "Error desconocido al registrarse");
    }
  };


  return (
    <LinearGradient colors={Colors.gradient} style={GlobalStyles.container}>
      <ScrollView contentContainerStyle={GlobalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={GlobalStyles.card}>
          <View style={GlobalStyles.logoContainer}>
            <GraduationCap color="#fff" size={35} fill="#fff" />
          </View>

          {screen === 'login' ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={GlobalStyles.title}>EduGamefy</Text>
              <Text style={GlobalStyles.subtitle}>Aprende jugando, crece aprendiendo</Text>

              <Text style={GlobalStyles.label}>Usuario</Text>
              <View style={GlobalStyles.inputContainer}>
                <Mail color="#9CA3AF" size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Ingrese su email o username"
                  autoCapitalize="none"
                  style={GlobalStyles.input}
                  keyboardType="default"
                />
              </View>

              <Text style={GlobalStyles.label}>Contraseña</Text>
              <View style={GlobalStyles.inputContainer}>
                <Lock color="#9CA3AF" size={20} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ingrese su contraseña"
                  secureTextEntry
                  style={GlobalStyles.input}
                />
                <Eye color="#9CA3AF" size={20} />
              </View>

              {error ? <Text style={{ color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}

              <TouchableOpacity style={GlobalStyles.button} onPress={handleLogin}>
                <Text style={GlobalStyles.buttonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
               


              <TouchableOpacity onPress={() => setScreen('register')} style={{ marginTop: 20 }}>
                <Text style={GlobalStyles.footerText}>¿No tienes una cuenta? <Text style={GlobalStyles.linkBold}>Regístrate aquí</Text></Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={GlobalStyles.title}>Crear Cuenta</Text>
              <Text style={GlobalStyles.subtitle}>Únete a nuestra comunidad educativa</Text>

              <Text style={GlobalStyles.label}>¿Cómo te unirás?</Text>
              <View style={GlobalStyles.roleRow}>
                <TouchableOpacity
                  style={[GlobalStyles.roleButton, role === 'estudiante' && GlobalStyles.roleActive]}
                  onPress={() => setRole('estudiante')}
                >
                  <GraduationCap color={role === 'estudiante' ? '#7C3AED' : '#9CA3AF'} size={24} />
                  <Text style={[GlobalStyles.roleText, role === 'estudiante' && GlobalStyles.roleTextActive]}>Estudiante</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.roleButton, role === 'docente' && GlobalStyles.roleActive]}
                  onPress={() => setRole('docente')}
                >
                  <Users color={role === 'docente' ? '#7C3AED' : '#9CA3AF'} size={24} />
                  <Text style={[GlobalStyles.roleText, role === 'docente' && GlobalStyles.roleTextActive]}>Docente</Text>
                </TouchableOpacity>
              </View>

              <Text style={GlobalStyles.label}>Nombre Completo</Text>
              <View style={GlobalStyles.inputContainer}>
                <User color="#9CA3AF" size={20} />
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                  style={GlobalStyles.input}
                />
              </View>

              <Text style={GlobalStyles.label}>Correo Electrónico</Text>
              <View style={GlobalStyles.inputContainer}>
                <Mail color="#9CA3AF" size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ejemplo@correo.com"
                  style={GlobalStyles.input}
                />
              </View>

              <Text style={GlobalStyles.label}>Contraseña</Text>
              <View style={GlobalStyles.inputContainer}>
                <Lock color="#9CA3AF" size={20} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="........"
                  secureTextEntry
                  style={GlobalStyles.input}
                />
              </View>

             <TouchableOpacity style={GlobalStyles.button} onPress={handleRegister}>
                <Text style={GlobalStyles.buttonText}>Crear Cuenta</Text>
            </TouchableOpacity>

              <TouchableOpacity onPress={() => setScreen('login')} style={{ marginTop: 15 }}>
                <Text style={GlobalStyles.footerText}>¿Ya tienes cuenta? <Text style={GlobalStyles.linkBold}>Inicia sesión</Text></Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
