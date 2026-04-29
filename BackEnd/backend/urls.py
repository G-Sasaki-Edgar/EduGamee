from django.contrib import admin
from django.urls import path, include  # <--- ¡AQUÍ ESTABA EL ERROR! Faltaba el ', include'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('miProyecto.urls')),
]
