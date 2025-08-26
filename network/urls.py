
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("updatePost/<int:postId>", views.updatePost, name="edit"),
    path("userProfile<str:uname>", views.userProfile, name="userProfile"),
    path("following", views.following, name="following"),
    path("follow/<str:uname>", views.follow, name="follow"),
    path("like/<int:postId>", views.like, name="like")
]
