import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .models import User, Posts, Follower, Likes


def index(request):
    posts = Posts.objects.order_by("-created").all()
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")

    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {
        "page_obj" : page_obj,
        "currentUser" : request.user.username,
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def post(request):
    posts = Posts.objects.order_by("-created").all()
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")

    page_obj = paginator.get_page(page_number)

    if request.method != "POST":
        return render(request, "network/index.html", {
            "page_obj" : page_obj,
            "currentUser" : request.user.username,
    })
    
    data = json.loads(request.body)
    body = data.get("body", "")
    user = request.user

    post = Posts.objects.create(owner=user, text=body)

    return render(request, "network/index.html", {
            "page_obj" : page_obj,
            "currentUser" : request.user.username,
        })

def userProfile(request, uname):
    userName = uname
    userId = User.objects.get(username=uname).id
    followees = Follower.objects.filter(
        followee=userId
    )
    followers = Follower.objects.filter(
        follower=userId
    )

    print(followees.count())
    print(followers.count())

    posts = Posts.objects.order_by("-created").filter(
        owner=userId
    )

    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")

    page_obj = paginator.get_page(page_number)

    return render(request, "network/userProfile.html", {
        "page_obj" : page_obj,
        "currentUser" : request.user.username,
        "userProfile" : userName,
        "followers" : followers.count(),
        "followees" : followees.count()
    })

@csrf_exempt
def follow(request, uname):
    unameId = User.objects.get(username=uname).id
    follows = Follower.objects.filter(follower=request.user, followee=unameId)

    if request.method == "PUT":
        data = json.loads(request.body)
        followee = User.objects.get(username=data["followee"])
        follower = User.objects.get(username=request.user.username)
        Follower.objects.create(follower=follower, followee=followee)

    elif request.method == "DELETE":
        data = json.loads(request.body)
        followee = User.objects.get(username=data["followee"])
        follower = User.objects.get(username=request.user.username)
        follow = Follower.objects.get(follower=follower, followee=followee.id)
        follow.delete()

    return JsonResponse({
        "follows" : [follow.serialize() for follow in follows]
    })

def following(request):
    following = Follower.objects.filter(follower=request.user).values_list('followee')

    posts = Posts.objects.order_by("-created").filter(owner__id__in=following)
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")

    page_obj = paginator.get_page(page_number)

    return render(request, "network/following.html", {
        "page_obj" : page_obj,
        "currentUser" : request.user.username,
    })

@csrf_exempt
@login_required
def updatePost(request, postId):
    try:
        update = Posts.objects.get(owner=request.user, pk=postId)
    except:
        return JsonResponse({"error": "Post not found."}, status=404)

    data = json.loads(request.body)
    text = data.get("text", "")
    user = request.user
    update.text = text
    update.save()
    return JsonResponse({"message": "Status updated successfully"}, status=201)

@csrf_exempt
@login_required
def like(request, postId):
    liker = request.user
    postIdentifier = postId

    if request.method == "POST":
        
        data = json.loads(request.body)
        liker = User.objects.get(username=request.user.username)
        currentPost = data["post"]
        Likes.objects.create(post_id=currentPost, liker=liker)

        post = Posts.objects.get(pk=postIdentifier)
        post.likeCount += 1
        post.save()

    elif request.method == "DELETE":
        data = json.loads(request.body)
        liker = User.objects.get(username=request.user.username)
        currentPost = data["post"]
        like = Likes.objects.get(post=currentPost, liker=liker)
        like.delete()

        post = Posts.objects.get(pk=postIdentifier)
        post.likeCount -= 1
        post.save()

    likes = Likes.objects.filter(liker_id=liker, post_id=postId)

    return JsonResponse({
        "likes": [like.serialize() for like in likes]
    })
