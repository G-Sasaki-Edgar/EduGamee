from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import PerfilUsuario, Logro, LogroUsuario, Tarea, Inscripcion

@receiver(post_save, sender=PerfilUsuario)
def verificar_logros(sender, instance, **kwargs):
    """
    Cada vez que se actualiza el perfil (xp_total cambia),
    verifica si el usuario desbloqueó nuevos logros.
    """
    usuario = instance.usuario
    xp_actual = instance.xp_total

    # Logros que el usuario AÚN NO tiene
    logros_ya_obtenidos = LogroUsuario.objects.filter(
        usuario=usuario
    ).values_list('logro_id', flat=True)

    logros_disponibles = Logro.objects.exclude(
        id__in=logros_ya_obtenidos
    ).filter(xp_requerida__lte=xp_actual)

    # Otorgar los logros que cumple
    for logro in logros_disponibles:
        LogroUsuario.objects.create(usuario=usuario, logro=logro)

@receiver(post_save, sender=Tarea)
def notificar_nueva_tarea(sender, instance, created, **kwargs):
    if not created:
        return  # Solo cuando se crea, no cuando se edita

    channel_layer = get_channel_layer()
    
    # Buscar todos los estudiantes inscritos en el curso
    inscripciones = Inscripcion.objects.filter(
        curso=instance.curso
    ).select_related('estudiante')

    for inscripcion in inscripciones:
        estudiante_id = inscripcion.estudiante.id
        async_to_sync(channel_layer.group_send)(
            f"notif_user_{estudiante_id}",
            {
                "type": "notificacion_tarea",
                "mensaje": f"Nueva tarea: {instance.titulo}",
                "tarea_id": instance.id,
                "curso": instance.curso.nombre,
            }
        )