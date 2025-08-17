document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#all-posts').addEventListener('click', function (event) {
        event.preventDefault();
        loadAllPosts();
    });

    const form = document.querySelector('#statusUpdate')
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const body = document.querySelector('#post-body').value;
        console.log(body)
        fetch('/post', {
            method: 'POST',
            body: JSON.stringify({
                body: body
            })
        })
            .then(response => response.json())
            .then(result => {
                document.querySelector('#post-body').value = '';
                loadAllPosts()
            });
    });

    loadAllPosts()
});

function loadAllPosts() {
    document.querySelector('#post-body').value = '';
    const container = document.querySelector('#allPosts')
    container.innerHTML = ""

    fetch('/loadAllPosts')
        .then(response => response.json())
        .then(posts => {
            for (let i = 0; i < posts.length; i++) {
                let owner = posts[i].owner
                let text = posts[i].text
                let created = posts[i].created

                const element = document.createElement('div')
                element.classList.add('post')
                element.innerHTML = `<h1>${owner}</h1><i>${text}</i> <br> ${created}`
                document.querySelector('#allPosts').append(element);
            }
        })
}