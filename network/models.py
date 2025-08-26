from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass
    
class Posts(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    likeCount = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.owner} said {self.text} on {self.created} and got {self.likeCount}likes"
    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "text": self.text,
            "created": self.created.strftime("%b %d %I:%M"),
            "likeCount": self.likeCount
        }

class Follower(models.Model):
    followee = models.ForeignKey(User, related_name="followee", on_delete=models.CASCADE)
    follower = models.ForeignKey(User, related_name="follower", on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.follower} follows {self.followee}"

    def serialize(self):
        return {
            "id": self.id,
            "follower": self.follower.username,
            "followee": self.followee.username
        } 

class Likes(models.Model):
    post = models.ForeignKey(Posts, related_name="likes", on_delete=models.CASCADE)
    liker = models.ForeignKey(User, related_name="liker", on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.liker} liked this post: {self.post}"
    def serialize(self):
        return {
            "id": self.id,
            "post": self.post.id,
            "liker": self.liker.username
        }