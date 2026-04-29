from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from .views import (
    PerfilUsuarioViewSet, CursoViewSet, TareaViewSet,
    InscripcionViewSet, EntregaViewSet, LogroViewSet, UserViewSet, ComentarioListCreateView,MisCursosView,MisTareasView,MisCursosDocenteView,MisCursosConTareasView,
    register, login, obtener_perfil, ranking, unirse_curso, entregas_docente, entregar_tarea, calificar_entrega, LogrosView,
)

router = routers.DefaultRouter()
router.register(r'usuarios', UserViewSet)
router.register(r'perfiles', PerfilUsuarioViewSet)
router.register(r'cursos', CursoViewSet)
router.register(r'tareas', TareaViewSet)
router.register(r'inscripciones', InscripcionViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'logros', LogroViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', register, name='registro'),
    path('login/', login, name='login'),
    path('comentarios/', ComentarioListCreateView.as_view(), name='comentarios-list'),
    path('mis-cursos/', MisCursosView.as_view(), name='mis-cursos'),
    path('perfil/', obtener_perfil, name="perfil"),
    path('mis-tareas/', MisTareasView.as_view(), name='mis-tareas'),
    path('mis-cursos-docente/', MisCursosDocenteView.as_view(), name='mis-cursos-docente'),
    path('mis-cursos-con-tareas/', MisCursosConTareasView.as_view(), name='mis-cursos-con-tareas'),
    path('ranking/', ranking, name='ranking'),
    path('Incribirse/', unirse_curso, name='Incribirse'),
    path('entregas-docente/', entregas_docente, name='entregas-docente'),
    path('entregar-tarea/', entregar_tarea, name='entregar-tarea'),
    path('calificar-entrega/<int:entrega_id>/', calificar_entrega, name='calificar-entrega'),
    path('logros/', LogrosView.as_view(), name='logros'),

]
