from rest_framework import serializers
from .models import PerfilUsuario, Curso, Tarea, Inscripcion, Entrega, Logro, ComentarioTarea
from django.contrib.auth.models import User
from django.conf import settings  # ← AGREGÁ ESTO
from .models import LogroUsuario


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class LogroSerializer(serializers.ModelSerializer):
    obtenido = serializers.SerializerMethodField()
    obtenido_en = serializers.SerializerMethodField()
    icono_url = serializers.SerializerMethodField()  # ← NUEVO

    class Meta:
        model = Logro
        fields = ['id', 'nombre', 'descripcion', 'nombre_icono', 
                  'xp_requerida', 'obtenido', 'obtenido_en', 'icono_url']  # ← AGREGADO

    def get_obtenido(self, obj):
        usuario = self.context['request'].user
        return LogroUsuario.objects.filter(
            usuario=usuario, logro=obj
        ).exists()

    def get_obtenido_en(self, obj):
        usuario = self.context['request'].user
        logro_usuario = LogroUsuario.objects.filter(
            usuario=usuario, logro=obj
        ).first()
        if logro_usuario:
            return logro_usuario.obtenido_en.strftime('%d/%m/%Y')
        return None

    # ← NUEVO MÉTODO
    def get_icono_url(self, obj):
        if obj.nombre_icono:
            return f"{settings.S3_BASE_URL}/iconos/{obj.nombre_icono}"
        return None


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='usuario', write_only=True
    )
    logros_obtenidos = LogroSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()  # ← NUEVO

    class Meta:
        model = PerfilUsuario
        fields = ['id', 'usuario', 'usuario_id', 'rol', 'avatar', 'avatar_url',  # ← AGREGADO avatar_url
                  'xp_total', 'nivel_actual', 'logros_obtenidos']

    # ← NUEVO MÉTODO
    def get_avatar_url(self, obj):
        if obj.avatar:
            return f"{settings.S3_BASE_URL}/avatares/{obj.avatar}"
        return None


# ── El resto queda EXACTAMENTE igual ──────────────────────────────

class CursoSerializer(serializers.ModelSerializer):
    docente = UserSerializer(read_only=True)
    docente_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='docente', write_only=True
    )
    class Meta:
        model = Curso
        fields = ['id', 'nombre', 'descripcion', 'codigo_acceso', 'docente', 'docente_id', 'color_tema', 'creado_en']


class TareaSerializer(serializers.ModelSerializer):
    curso = CursoSerializer(read_only=True)
    curso_id = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(), source='curso', write_only=True
    )
    class Meta:
        model = Tarea
        fields = ['id', 'curso', 'curso_id', 'titulo', 'instrucciones', 'xp_recompensa', 'fecha_entrega']


class InscripcionSerializer(serializers.ModelSerializer):
    estudiante = UserSerializer(read_only=True)
    estudiante_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='estudiante', write_only=True
    )
    curso = CursoSerializer(read_only=True)
    curso_id = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(), source='curso', write_only=True
    )
    class Meta:
        model = Inscripcion
        fields = ['id', 'estudiante', 'estudiante_id', 'curso', 'curso_id', 'unido_en']


class EntregaSerializer(serializers.ModelSerializer):
    tarea = TareaSerializer(read_only=True)
    tarea_id = serializers.PrimaryKeyRelatedField(
        queryset=Tarea.objects.all(), source='tarea', write_only=True
    )
    estudiante = UserSerializer(read_only=True)
    estudiante_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='estudiante', write_only=True
    )
    class Meta:
        model = Entrega
        fields = ['id', 'tarea', 'tarea_id', 'estudiante', 'estudiante_id', 'contenido', 'estado', 'xp_ganada', 'entregado_en']


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        PerfilUsuario.objects.create(
            usuario=user,
            rol="estudiante",
            avatar="default.png",
            xp_total=0,
            nivel_actual=1
        )
        return user


class ComentarioTareaSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.ReadOnlyField(source='autor.username')
    class Meta:
        model = ComentarioTarea
        fields = ['id', 'tarea', 'autor', 'autor_nombre', 'mensaje', 'creado_en']