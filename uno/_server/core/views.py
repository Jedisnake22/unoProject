from django.shortcuts import render
from django.conf  import settings
import json
import os
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict
from . import models

# Load manifest when server launches
MANIFEST = {}
if not settings.DEBUG:
    f = open(f"{settings.BASE_DIR}/core/static/manifest.json")
    MANIFEST = json.load(f)

# Create your views here.
@login_required
def index(req):
    context = {
        "asset_url": os.environ.get("ASSET_URL", ""),
        "debug": settings.DEBUG,
        "manifest": MANIFEST,
        "js_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["file"],
        "css_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["css"][0]
    }
    return render(req, "core/index.html", context)

@login_required
def profile(req):
    return JsonResponse({"user": model_to_dict(req.user)})

def getProfile(req):
    try:
        user = models.User.objects.get(id=req.headers.get("id"))
        return JsonResponse({"user": model_to_dict(user)})
    except models.User.DoesNotExist:
        return JsonResponse({"user": None})
    
def getStats(req):
    try:
        stats = models.Stats.objects.get(id=req.headers.get("id"))
        return JsonResponse({"stats": model_to_dict(stats)})
    except models.Stats.DoesNotExist:
        return JsonResponse({"stats": None})

@login_required
def autosave(req):
    try:
        save = models.Autosave.objects.get(user=req.user)
        return JsonResponse({"autosave": model_to_dict(save)})
    except models.Autosave.DoesNotExist:
        return JsonResponse({"autosave": None})
    
@login_required
def saveAutosave(req):
    body = json.loads(req.body)
    save = models.Autosave(
        user = req.user,
        gameState=body["gameState"]
    )

    try:
        existingSave = models.Autosave.objects.get(user=req.user)
        existingSave.gameState = body["gameState"]
        existingSave.save()
        save = existingSave
    except:
        save.save()

    return JsonResponse({"gameState": model_to_dict(save)})

@login_required
def deleteAutosave(req):
    try:
        save = models.Autosave.objects.get(user=req.user)
        save.delete()
        return JsonResponse({"status": "deleted"})
    except models.Autosave.DoesNotExist:
        return JsonResponse({"status": "no_save_found"})

@login_required
def friends(req):
    if req.method == "POST":
        try:
            body = json.loads(req.body)
            if str(req.user.id) == body["reqID"]:
                return JsonResponse({"request": "user"})
            if models.Friends.objects.filter(fromUser=req.user, toUser=models.User.objects.get(id=body["reqID"])).exists():
                return JsonResponse({"request": "exists"})
            if models.Friends.objects.filter(toUser=req.user, fromUser=models.User.objects.get(id=body["reqID"])).exists():
                return JsonResponse({"request": "exists"})
            friendRequest = models.Friends(
                fromUser = req.user,
                toUser = models.User.objects.get(id=body["reqID"]),
                status = "Pending"
            )
            friendRequest.save()
            return JsonResponse({"request": "sent"})
        except models.User.DoesNotExist:
            return JsonResponse({"request": "fail"})
    try:
        if req.headers.get("myRequest") == "true":
            return JsonResponse({ "friendSent": [model_to_dict(request) for request in req.user.friend_send.all()]})
        else: 
            return JsonResponse({ "friendReq": [model_to_dict(request) for request in req.user.friend_receive.all()]})
    
    except models.Friends.DoesNotExist:
        if req.headers.get("myRequest") == "true":
            return JsonResponse({ "friendSent": None })
        else:
            return JsonResponse({ "friendReq": None })

@login_required
def friendsUpdate(req):
    body=json.loads(req.body)
    request = models.Friends.objects.get(id=body["reqID"])
    request.status = "Accepted"
    request.save()

@login_required
def friendDelete(req):
    body = json.loads(req.body)
    save = models.Friends.objects.get(id=body["reqID"])
    save.delete()
    return JsonResponse({"status": "deleted"})
    
@login_required
def incWon(req):
    stats = models.Stats.objects.get(user=req.user)
    stats.gamesWon += 1
    stats.save()
    return JsonResponse({"status": "incremented"})

@login_required
def incPlayed(req):
    stats = models.Stats.objects.get(user=req.user)
    stats.gamesPlayed += 1
    stats.save()
    return JsonResponse({"status": "incremented"})
