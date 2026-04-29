from django.apps import AppConfig


class MiproyectoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'miProyecto'

    def ready(self):
        import miProyecto.signals