from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path("profile/", view=views.profile, name="profile"),
    path("profile/get", view=views.getProfile, name="getProfile"),
    path("autosave/", view=views.autosave, name="autosave"),
    path("autosave/save/", view=views.saveAutosave, name="saveAutosave"),
    path("autosave/delete/", view=views.deleteAutosave, name="deleteAutosave"),
    path("stats/won/", view=views.incWon, name="updateStats"),
    path("stats/played/", view=views.incPlayed, name="incrementPlayed"),
    path("stats/get/", view=views.getStats, name="getStats"),
    path("friends/", view=views.friends, name="getFriends"),
    path("friends/delete/", view=views.friendDelete, name="deleteFriend"),
    path("friends/update/", view=views.friendsUpdate, name="accept")
]
