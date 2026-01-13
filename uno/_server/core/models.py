from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Autosave(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gameState = models.JSONField()

class Stats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gamesWon = models.IntegerField()
    gamesPlayed = models.IntegerField()

class Friends(models.Model):
    fromUser = models.ForeignKey(User, related_name="friend_send", on_delete=models.CASCADE)
    toUser = models.ForeignKey(User, related_name="friend_receive", on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted")])