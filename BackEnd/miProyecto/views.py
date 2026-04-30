from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import generics
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PerfilUsuario, Curso, Tarea, Inscripcion, Entrega, Logro, ComentarioTarea
from .serializers import (
    PerfilUsuarioSerializer, CursoSerializer, TareaSerializer,
    InscripcionSerializer, EntregaSerializer, LogroSerializer, UserSerializer, ComentarioTareaSerializer
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings



# --- CRUD ViewSets ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer
    

class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class LogroViewSet(viewsets.ModelViewSet):
    queryset = Logro.objects.all()
    serializer_class = LogroSerializer

class ComentarioListCreateView(generics.ListCreateAPIView):
    queryset = ComentarioTarea.objects.all()
    serializer_class = ComentarioTareaSerializer


# --- Registro ---
@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'estudiante')
    first_name = request.data.get('first_name', '')

    if not username or not email or not password:
        return Response({'detail': 'Faltan datos obligatorios: username, email, password.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'El username ya existe.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'El correo ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name)
    perfil = PerfilUsuario.objects.create(usuario=user, rol=role, xp_total=0, nivel_actual=1, avatar="default.png")

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'role': perfil.rol,
        'xp_total': perfil.xp_total,
        'nivel_actual': perfil.nivel_actual,
        'avatar': perfil.avatar
    }, status=status.HTTP_201_CREATED)

# --- Login con JWT ---
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'detail': 'Credenciales incompletas.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(request, username=user.username, password=password)
    if user is None:
        return Response({'detail': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

    perfil = PerfilUsuario.objects.filter(usuario=user).first()

    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': perfil.rol if perfil else 'estudiante',
        'xp_total': perfil.xp_total if perfil else 0,
        'nivel_actual': perfil.nivel_actual if perfil else 1,
        'avatar': perfil.avatar if perfil else "default.png",
        'access': access,
        'refresh': str(refresh)
    })

@api_view(['GET'])
def obtener_perfil(request):
    perfil = PerfilUsuario.objects.get(usuario=request.user)
    serializer = PerfilUsuarioSerializer(perfil)
    return Response(serializer.data)


@api_view(['GET'])
def buscar_cursos(request):
    query = request.GET.get('q', '')
    cursos = Curso.objects.filter(nombre__icontains=query) | Curso.objects.filter(descripcion__icontains=query)
    serializer = CursoSerializer(cursos, many=True)
    return Response(serializer.data)
# --- Endpoint: Mis Cursos ---
class MisCursosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtra inscripciones del estudiante logueado
        inscripciones = Inscripcion.objects.filter(estudiante=request.user)
        cursos = [i.curso for i in inscripciones]
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)

# --- Endpoint: Mis Tareas ---
class MisTareasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtiene cursos en los que el estudiante está inscrito
        inscripciones = Inscripcion.objects.filter(estudiante=request.user)
        cursos_ids = [i.curso.id for i in inscripciones]
        tareas = Tarea.objects.filter(curso_id__in=cursos_ids)

        # Obtener entregas del estudiante para estas tareas
        entregas_estudiante = Entrega.objects.filter(
            estudiante=request.user,
            tarea__in=tareas
        ).values_list('tarea_id', flat=True)

        # Serializar tareas con información de entrega
        tareas_data = []
        for tarea in tareas:
            tarea_dict = TareaSerializer(tarea).data
            tarea_dict['entregada'] = tarea.id in entregas_estudiante
            tareas_data.append(tarea_dict)

        return Response(tareas_data)

# --- Endpoint: Mis Cursos (Docente) ---
class MisCursosDocenteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtra cursos creados por el docente logueado
        cursos = Curso.objects.filter(docente=request.user)
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)

class MisCursosConTareasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtiene cursos del docente con sus tareas ordenadas por fecha de entrega
        cursos = Curso.objects.filter(docente=request.user).prefetch_related('tareas')

        cursos_data = []
        for curso in cursos:
            tareas_ordenadas = curso.tareas.order_by('fecha_entrega')
            curso_data = {
                'id': curso.id,
                'nombre': curso.nombre,
                'descripcion': curso.descripcion,
                'codigo_acceso': curso.codigo_acceso,
                'color_tema': curso.color_tema,
                'creado_en': curso.creado_en,
                'tareas': [
                    {
                        'id': tarea.id,
                        'titulo': tarea.titulo,
                        'instrucciones': tarea.instrucciones,
                        'xp_recompensa': tarea.xp_recompensa,
                        'fecha_entrega': tarea.fecha_entrega,
                    } for tarea in tareas_ordenadas
                ]
            }
            cursos_data.append(curso_data)

        return Response(cursos_data)

# --- Endpoint: Ranking Global ---
@api_view(['GET'])
def ranking(request):
    perfiles = PerfilUsuario.objects.select_related('usuario').order_by('-xp_total', '-nivel_actual')
    ranking_data = []
    
    for idx, perfil in enumerate(perfiles, 1):
        # Usar first_name si existe, si no usar username
        nombre = perfil.usuario.first_name or perfil.usuario.username
        
        
    
        ranking_data.append({
            'posicion': idx,
            'nombre_jugador': nombre,
            'email': perfil.usuario.email,
            'rol': perfil.rol,
            'xp_total': perfil.xp_total,
            'nivel_actual': perfil.nivel_actual,
            'avatar': perfil.avatar,
            'avatar_url': f"{settings.S3_BASE_URL}/avatares/Docente.jpg" if perfil.rol == 'docente' else f"{settings.S3_BASE_URL}/avatares/Alumno.jpg"
        })
    return Response(ranking_data)

@api_view(['POST'])
def unirse_curso(request):
    codigo_acceso = request.data.get('codigo_acceso')
    estudiante_id = request.data.get('estudiante_id')

    if not codigo_acceso or not estudiante_id:
        return Response({'detail': 'Faltan datos.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        curso = Curso.objects.get(codigo_acceso=codigo_acceso)
    except Curso.DoesNotExist:
        return Response({'detail': 'Código de curso inválido.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        estudiante = User.objects.get(id=estudiante_id)
    except User.DoesNotExist:
        return Response({'detail': 'Estudiante no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if Inscripcion.objects.filter(estudiante=estudiante, curso=curso).exists():
        return Response({'detail': 'Ya estás inscrito en este curso.'}, status=status.HTTP_400_BAD_REQUEST)

    Inscripcion.objects.create(estudiante=estudiante, curso=curso)
    return Response({'detail': f'Te uniste al curso {curso.nombre} exitosamente.'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def entregas_docente(request):
    user = request.user
    entregas = Entrega.objects.filter(tarea__curso__docente=user)
    serializer = EntregaSerializer(entregas, many=True)
    return Response(serializer.data)

# Estudiante entrega su tarea
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def entregar_tarea(request):
    tarea_id = request.data.get('tarea_id')
    contenido = request.data.get('contenido', '')

    if not tarea_id:
        return Response({'detail': 'Falta tarea_id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tarea = Tarea.objects.get(id=tarea_id)
    except Tarea.DoesNotExist:
        return Response({'detail': 'Tarea no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if Entrega.objects.filter(tarea=tarea, estudiante=request.user).exists():
        return Response({'detail': 'Ya entregaste esta tarea.'}, status=status.HTTP_400_BAD_REQUEST)

    entrega = Entrega.objects.create(
        tarea=tarea,
        estudiante=request.user,
        contenido=contenido,
        estado='pendiente',
        xp_ganada=0
    )

    return Response({'detail': 'Tarea entregada exitosamente.', 'id': entrega.id}, status=status.HTTP_201_CREATED)


# Docente califica y el estudiante recibe XP automáticamente
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def calificar_entrega(request, entrega_id):
    try:
        entrega = Entrega.objects.get(id=entrega_id)
    except Entrega.DoesNotExist:
        return Response({'detail': 'Entrega no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if entrega.tarea.curso.docente != request.user:
        return Response({'detail': 'No tenés permiso para calificar esta entrega.'}, status=status.HTTP_403_FORBIDDEN)

    nuevo_estado = request.data.get('estado', entrega.estado)
    xp_ganada = request.data.get('xp_ganada', 0)

    # Validación: XP mínimo 10 y máximo según la tarea
    XP_MINIMO = 10
    xp_tarea = entrega.tarea.xp_recompensa
    
    if xp_ganada < XP_MINIMO:
        return Response({'detail': f'XP mínimo es {XP_MINIMO}.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if xp_ganada > xp_tarea:
        return Response({'detail': f'XP no puede ser mayor a {xp_tarea} (XP de la tarea).'}, status=status.HTTP_400_BAD_REQUEST)

    entrega.estado = nuevo_estado
    entrega.xp_ganada = xp_ganada
    entrega.save()

    if nuevo_estado == 'completada':
        perfil = PerfilUsuario.objects.get(usuario=entrega.estudiante)
        nivel_anterior = perfil.nivel_actual
        
        perfil.xp_total += xp_ganada
        # Fórmula: nivel = 1 + (xp_total // 100), máximo nivel 50
        perfil.nivel_actual = min(1 + (perfil.xp_total // 100), 50)
        perfil.save()
        
        # Indicar si subió de nivel
        subio_nivel = perfil.nivel_actual > nivel_anterior
        
        serializer = EntregaSerializer(entrega)
        response_data = serializer.data
        response_data['subio_nivel'] = subio_nivel
        response_data['nivel_anterior'] = nivel_anterior
        response_data['nivel_nuevo'] = perfil.nivel_actual
        response_data['xp_total'] = perfil.xp_total
        
        return Response(response_data)

    serializer = EntregaSerializer(entrega)
    return Response(serializer.data)

class LogrosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logros = Logro.objects.all().order_by('xp_requerida')
        serializer = LogroSerializer(logros, many=True, context={'request': request})
        return Response(serializer.data)
