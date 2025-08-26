document.addEventListener('DOMContentLoaded', function () {

    //post feature
    const userSignedIN = document.querySelector('.userProfile')
    const form = document.querySelector('#statusUpdate')
    if (form != null) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const body = document.querySelector('#post-body').value;
            document.querySelector('#post-body').value = ""
            fetch('/post', {
                method: 'POST',
                body: JSON.stringify({
                    body: body
                })
            })
                .then(() => {
                    window.location.reload()
                })
        });
    }

    //follow button on "follow" page
    const currentUser = document.querySelector(".userProfile")
    const profileName = document.querySelector("#userTitle")
    if (currentUser && profileName) {
        if (currentUser.innerText.trim() != profileName.innerText.trim()) {

            const header = document.querySelector(".profileHeader");
            const followBtn = document.createElement('button');
            followBtn.classList.add("btn-primary");
            fetch(`/follow/${profileName.innerText.trim()}`)
                .then(response => response.json())
                .then(info => {
                    trueFalse = info.follows.length;
                    if (trueFalse == 0) {
                        followBtn.innerText = "Follow";
                        followBtn.type = "submit"
                        const followBtnForm = document.querySelector('#followButton')
                        if (followBtnForm != null) {
                            followBtnForm.append(followBtn)
                            followBtn.addEventListener('click', (event) => {
                                event.preventDefault()
                                userProfileFollowBtn(currentUser.innerText.trim(), profileName.innerText.trim(), followBtn);
                            });
                        }
                    } else {
                        followBtn.innerText = "Unfollow";
                        followBtn.type = "submit"
                        const followBtnForm = document.querySelector('#followButton')
                        if (followBtnForm != null) {
                            followBtnForm.append(followBtn);
                            followBtn.addEventListener('click', (event) => {
                                event.preventDefault();
                                userProfileFollowBtn(currentUser.innerText.trim(), profileName.innerText.trim(), followBtn);
                            });
                        }
                    }

                });

        }
    }

    //like feature
    if (userSignedIN != null) {
        function heartClick(event) {
            event.preventDefault()
            const postId = event.currentTarget.classList[1]
            const postIndex = (event.srcElement.id).toString()
            updateLike(event, postId, postIndex)
        }

        const editButton = document.querySelectorAll('.editButton')
        editButton.forEach((editBtn) => {
            editBtn.addEventListener('click', editPost)
        });
    }
    const hearts = document.querySelectorAll('.clickLike');
    hearts.forEach((heart) => {
        heart.addEventListener('click', heartClick);
    });

    //edit post
    function editPost(event) {
        event.preventDefault()
        const postId = event.currentTarget.classList[3]
        const editButton = event.currentTarget;
        const postContainer = editButton.closest('.post');
        let postContent = postContainer.querySelector('p');

        postContent.style.display = "none"
        editButton.style.display = "none"

        let newForm = document.createElement('textarea')
        newForm.innerText = postContent.innerText
        newForm.classList.add("post")
        newForm.setAttribute('name', 'new-text');

        let saveEdit = document.createElement('form')
        saveEdit.classList.add("btn", "text-danger", "strong", "submitSave")

        let saveButton = document.createElement('button')
        saveButton.type = "submit"
        saveButton.classList.add("btn", "btn-primary");
        saveButton.innerText = "Save"
        newForm.classList.add("largeFont")
        saveEdit.append(saveButton)

        postContainer.append(newForm)
        postContainer.append(saveEdit)

        saveEdit.addEventListener('submit', (event) => {
            event.preventDefault();
            const text = newForm.value

            console.log(postId)
            console.log(text)
            fetch(`/updatePost/${postId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    text: text
                })
            }).then(data => {
                console.log(data)

                document.querySelector('button').style.display = 'block'
                newForm.style.display = "none"
                postContent.style.display = "block"
                editButton.style.display = "inline-block"
                saveButton.style.display = "none"
                postContent.innerText = text
                saveEdit.style.display = "none"
            })

        })

    }
});

//functions
function updateLike(event, postId, postIndex) {
    event.preventDefault()
    currentPost = postId
    postIndex = postIndex.toString()

    fetch(`like/${postId}`)
        .then(response => response.json())
        .then(info => {
            if (info["likes"].length == 0) {
                fetch(`like/${currentPost}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        post: currentPost
                    })
                })
                // let likeCount = document.getElementById(`#${postIndex}`)
                let likeCount = document.getElementById(`${postIndex}`)
                let likes = likeCount.previousElementSibling.childNodes[1].innerText

                likeCount.previousElementSibling.childNodes[1].innerText = parseInt(likes) + 1

                // likeCount.parentElement.innerText = "Total Likes " + (parseInt(likeCount.innerText) + 1)

            } else {
                fetch(`like/${currentPost}`, {
                    method: "DELETE",
                    body: JSON.stringify({
                        post: currentPost
                    })
                })
                let likeCount = document.getElementById(`${postIndex}`)
                let likes = likeCount.previousElementSibling.childNodes[1].innerText

                likeCount.previousElementSibling.childNodes[1].innerText = parseInt(likes) - 1
            }
            // console.log(info["likes"].length)
        })
}

function userProfileFollowBtn(currentUser, profileName, followBtn) {
    fetch(`/follow/${profileName}`)
        .then(response => response.json())
        .then(info => {
            if (info.follows.length == 1) {
                fetch(`/follow/${profileName}`, {
                    method: "DELETE",
                    body: JSON.stringify({
                        followee: profileName,
                    })
                })
                followBtn.innerText = "Follow"
                let followers = document.querySelector('#followeeCount')
                followers.textContent = `${parseInt(followers.textContent) - 1}`
            } else {
                fetch(`/follow/${profileName}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        followee: profileName,
                    })
                })
                followBtn.innerText = "Unfollow"
                let followers = document.querySelector('#followeeCount')
                followers.textContent = `${parseInt(followers.textContent) + 1}`
            }

        });

}



















//pre-template mess - ignore
// function loadProfile(uname) {
//     document.querySelector('#userProfileInfo').value = '';
//     const statusBox = document.querySelector('#statusBox')
//     if (statusBox != null) {
//         document.querySelector('#statusBox').style.display = "none";
//     }

//     document.querySelector('#allPosts').style.display = "none";
//     document.querySelector('#userProfileInfo').innerHTML = "";
//     document.querySelector('#userProfileInfo').style.display = 'block';

//     fetch(`/userProfile/${uname}`)
//         .then(response => response.json())
//         .then(info => {
//             if (info.currentUser != uname) {
//                 const followBtn = document.createElement('button')
//                 followBtn.classList.add('btn-primary')
//                 fetch(`/follow/${uname}`)
//                     .then(response => response.json())
//                     .then(info => {
//                         trueFalse = info.follows.length
//                         if (info.follows.length == 0) {
//                             followBtn.innerText = "Follow"
//                             followBtn.addEventListener('click', (event) => {
//                                 event.preventDefault()
//                                 fetch(`/follow/${uname}`)
//                                     .then(response => response.json())
//                                     .then(info => {
//                                         if (info.follows.length == 0) {
//                                             fetch(`/follow/${uname}`, {
//                                                 method: "PUT",
//                                                 body: JSON.stringify({
//                                                     followee: uname,
//                                                 })
//                                             })
//                                             followBtn.innerText = "Unfollow"
//                                             let followingCount = document.querySelector('h4')
//                                             followingCount.innerHTML = `followers ${parseInt(followingCount.innerText.slice(9)) + 1}`
//                                         } else {
//                                             fetch(`/follow/${uname}`, {
//                                                 method: "DELETE",
//                                                 body: JSON.stringify({
//                                                     followee: uname,
//                                                 })
//                                             })
//                                             followBtn.innerText = "Follow"
//                                             let followingCount = document.querySelector('h4')
//                                             followingCount.innerHTML = `followers ${parseInt(followingCount.innerText.slice(9)) - 1}`

//                                         }
//                                     })

//                             })

//                         } else {
//                             followBtn.innerText = "Unfollow"
//                             followBtn.addEventListener('click', (event) => {
//                                 event.preventDefault()
//                                 fetch(`/follow/${uname}`)
//                                     .then(response => response.json())
//                                     .then(info => {
//                                         if (info.follows.length == 1) {
//                                             fetch(`/follow/${uname}`, {
//                                                 method: "DELETE",
//                                                 body: JSON.stringify({
//                                                     followee: uname,
//                                                 })
//                                             })
//                                             followBtn.innerText = "Follow"
//                                             let followingCount = document.querySelector('h4')
//                                             followingCount.innerHTML = `followers ${parseInt(followingCount.innerText.slice(9)) - 1}`
//                                         } else {
//                                             fetch(`/follow/${uname}`, {
//                                                 method: "PUT",
//                                                 body: JSON.stringify({
//                                                     followee: uname,
//                                                 })
//                                             })
//                                             followBtn.innerText = "Unfollow"
//                                             let followingCount = document.querySelector('h4')
//                                             followingCount.innerHTML = `followers ${parseInt(followingCount.innerText.slice(9)) + 1}`

//                                         }
//                                     })

//                             })
//                         }

//                     })

//                 document.querySelector('#userProfileInfo').append(followBtn)

//             }
//             document.querySelector('h1').innerText = uname
//             const followerCount = document.createElement('h4')
//             const followingCount = document.createElement('h4')

//             followerCount.innerHTML = `followers ${info.followers.length}`
//             followingCount.innerHTML = `following ${info.followees.length}`

//             document.querySelector('h1').append(followerCount)
//             document.querySelector('h1').append(followingCount)

//             for (let i = 0; i < info.posts.length; i++) {

//                 const postId = info.posts[i].id
//                 let owner = info.userName

//                 let text = info.posts[i].text
//                 let created = info.posts[i].created

//                 const likes = info.posts[i].likeCount
//                 let likePlural = "Total Likes"


//                 const element = document.createElement('div')
//                 const userHeader = document.createElement('h3')
//                 userHeader.innerHTML = `<a href="#" class="userProfile fireEvent"><h3>${owner}</h3></a>`
//                 if (info.currentUser == info.posts[i].owner) {
//                     element.classList.add('post')
//                     element.innerHTML = userHeader.innerHTML + `<button id="editPost" class="btn-primary btn editPost">Edit</button><br><i>${text}</i><br><inline></inline>Posted on:${created}<a href="#" id="clickLike" class="followButton"><inline class="likeButton" id="like">♥</a>${likePlural}: <span id="likeCount">${likes}</span></inline><br>`
//                     const heartIcon = element.querySelector("#clickLike")
//                     heartIcon.addEventListener('click', (event) => {
//                         updateLike(event, info.posts[i].id, element)
//                     })
//                     element.querySelector('.userProfile').addEventListener('click', (event) => {
//                         event.preventDefault()
//                         loadProfile(owner)
//                     })


//                     const editButton = element.querySelector('.editPost')
//                     editButton.addEventListener('click', (event) => {
//                         event.preventDefault()
//                         editPost()
//                         const tweet = element.querySelector('i')
//                         tweet.innerHTML = `<form id="compose-form" class="editForm">
//     <textarea id="post-body" class="editBox" name="update" required></textarea>
//     <button class="btn btn-primary" type="submit">Save</button>
// </form>`

//                         tweet.querySelector('form').classList.add('post-body')

//                         const form = tweet.querySelector('form')
//                         const formInput = tweet.querySelector('.editBox')
//                         tweet.querySelector('.editBox').classList.add('post-body')
//                         element.querySelector('button').style.display = 'none'
//                         formInput.value = text

//                         form.addEventListener('submit', (event) => {
//                             event.preventDefault()
//                             const update = form.querySelector(".editBox")

//                             text = update.value
//                             fetch(`/updatePost/${postId}`, {
//                                 method: 'PUT',
//                                 body: JSON.stringify({
//                                     text: text
//                                 })
//                             }).then(data => {
//                                 const lockIn = element.querySelector('textarea')
//                                 element.querySelector('button').style.display = 'block'
//                                 element.querySelector('form').style.display = 'none'
//                                 tweet.innerText = text

//                             })



//                         })


//                     })


//                     document.querySelector('#userProfileInfo').append(element);

//                 } else {
//                     element.classList.add('post')
//                     element.innerHTML = userHeader.innerHTML + `<br><i>${text}</i><br><inline></inline>Posted on:${created}<a href="" id="clickLike"><inline id="like">♥</a>${likePlural}: <span id="likeCount">${likes}</span></inline><br>`
//                     const heartIcon = element.querySelector("#clickLike")
//                     heartIcon.addEventListener('click', (event) => {
//                         updateLike(event, info.posts[i].id, element)
//                     })
//                     element.querySelector('.userProfile').addEventListener('click', (event) => {
//                         event.preventDefault()
//                         loadProfile(owner)
//                     })
//                     document.querySelector('#userProfileInfo').append(element);
//                 }


//             }
//         })
// }