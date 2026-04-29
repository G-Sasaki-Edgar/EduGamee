import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificacionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Cada usuario tiene su propio canal: notif_user_<id>
        self.group_name = f"notif_user_{self.user.id}"
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Recibe mensaje del grupo y lo manda al WebSocket
    async def notificacion_tarea(self, event):
        await self.send(text_data=json.dumps({
        "tipo": "nueva_tarea",
        "mensaje": event["mensaje"],
        "tarea_id": event["tarea_id"],
        "curso": event["curso"],
    }))