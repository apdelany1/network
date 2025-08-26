from django.contrib import admin
from .models import User, Posts, Follower, Likes

class PostsAdmin(admin.ModelAdmin):
    list_display = ("__str__",)

class FollowerAdmin(admin.ModelAdmin):
    list_display = ("__str__",)

class LikesAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


admin.site.register(Posts, PostsAdmin)
admin.site.register(Follower, FollowerAdmin)
admin.site.register(Likes, LikesAdmin)
