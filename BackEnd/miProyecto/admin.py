from django.contrib import admin
from .models import PerfilUsuario, Curso, Tarea, Inscripcion, Entrega, Logro

admin.site.register(PerfilUsuario)
admin.site.register(Curso)
admin.site.register(Tarea)
admin.site.register(Inscripcion)
admin.site.register(Entrega)
admin.site.register(Logro)