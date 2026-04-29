from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

# 1. Perfil de Usuario para diferenciar Docente de Estudiante
class PerfilUsuario(models.Model):
    ROLES = (
        ('docente', 'Docente'),
        ('estudiante', 'Estudiante'),
    )
    
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES, default='estudiante')
    avatar = models.CharField(max_length=255, blank=True, null=True) # Nombre del icono o URL
    xp_total = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    nivel_actual = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.usuario.username} - {self.rol}"

# 2. Tabla de Cursos
class Curso(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    codigo_acceso = models.CharField(max_length=10, unique=True) # Código para que el alumno se una
    docente = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'perfil__rol': 'docente'})
    color_tema = models.CharField(max_length=7, default='#4A90E2') # Color hexadecimal para la App
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

# 3. Tabla de Tareas (Gamificadas)
class Tarea(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='tareas')
    titulo = models.CharField(max_length=200)
    instrucciones = models.TextField()
    xp_recompensa = models.IntegerField(default=10) # Puntos que otorga
    fecha_entrega = models.DateTimeField()
    
    def __str__(self):
        return f"{self.titulo} ({self.curso.nombre})"

# 4. Inscripciones (Relación Alumno - Curso)
class Inscripcion(models.Model):
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'perfil__rol': 'estudiante'})
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='inscripciones')
    unido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('estudiante', 'curso') # Evita duplicados

# 5. Entregas y Progreso (Donde se suma la XP)
class Entrega(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('completada', 'Completada'),
        ('atrasada', 'Atrasada'),
    )
    
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE)
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE)
    contenido = models.TextField(blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    xp_ganada = models.IntegerField(default=0)
    entregado_en = models.DateTimeField(auto_now=True)
    comentario_docente = models.TextField(blank=True, null=True)  # ✅

    def __str__(self):
        return f"{self.estudiante.username} - {self.tarea.titulo}"

# 6. Logros / Medallas
class Logro(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    nombre_icono = models.CharField(max_length=50) # Para React Native
    xp_requerida = models.IntegerField()

    def __str__(self):
        return self.nombre
    
class ComentarioTarea(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    mensaje = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.autor.username} en {self.tarea.titulo}"
# 7. Relación Usuario - Logro obtenido
class LogroUsuario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='logros_obtenidos')
    logro = models.ForeignKey(Logro, on_delete=models.CASCADE, related_name='usuarios')
    obtenido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'logro')  # No duplicar el mismo logro

    def __str__(self):
        return f"{self.usuario.username} - {self.logro.nombre}"