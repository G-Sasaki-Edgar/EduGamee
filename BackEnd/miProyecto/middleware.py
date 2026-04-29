from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async



class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser, User
        from rest_framework_simplejwt.tokens import AccessToken

        query_string = scope.get('query_string', b'').decode()
        params = dict(p.split('=') for p in query_string.split('&') if '=' in p)
        token = params.get('token', '')
        scope['user'] = await self.get_user(token)
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token_key):
        from django.contrib.auth.models import AnonymousUser, User
        from rest_framework_simplejwt.tokens import AccessToken
        try:
            token = AccessToken(token_key)
            return User.objects.get(id=token['user_id'])
        except Exception:
            return AnonymousUser()