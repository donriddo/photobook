$(() => {
    window.currentPictureId = '';
    window.currentCommentId = '';
    window.currentThreadUrl = '';

    $('#commentButton').click((evt) => {
        evt.preventDefault();
        const text = $('#commentText').val();
        if (!text) {
            alert('Please enter some text');
            return false;
        }
        $.ajax({
            url: currentThreadUrl,
            type: 'POST',
            data: { text: text, picture: currentPictureId, comment: currentCommentId },
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        })
        .done((data) => {
            console.log({data});
            $('#commentText').val('');
            currentThreadUrl.includes('reply') ? setCommentThread(currentCommentId) : setPictureThread(currentPictureId);
        })
        .fail((err) => {
            console.log({err});
        });
    });

    $('#uploadButton').click((evt) => {
        evt.preventDefault();
        var fileInput = $('#image');
        console.log({fileInput: fileInput[0].files})
        var file = fileInput[0].files[0];
        if (!file) {
            alert('Please upload an image');
            return false;
        }
        var formData = new FormData();
        formData.append('image', file);
        $.ajax({
            url: 'http://localhost:37337/api/picture',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        })
        .done((data) => {
            console.log({data});
        })
        .fail((err) => {
            console.log({err});
        });
    });

    window.setPictureThread = async (id) => {
        currentPictureId = id;
        currentThreadUrl = 'http://localhost:37337/api/picture/comment/';
        let picture = await $.ajax({
            url: `http://localhost:37337/api/picture/${currentPictureId}`,
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        });
        $('#threadDisplay').empty();
        picture.comments.forEach(async comment => {
            console.log(comment)
            const user = await $.ajax({
                url: `http://localhost:37337/api/user/${comment.user}`,
                beforeSend: function (xhr) {
                    const userToken = localStorage.getItem('userToken');
                    xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
                }
            });
            $('#threadDisplay').append(`
                <div class="picturePost">
                    <div class="picTitle">${user.email}</div>
                    <p>${comment.text}</p>
                    <div class="picTitle">${comment.replies.length} replies</div>
                    <button onclick="setCommentThread(\'${comment._id}\')" class="photobutton">Reply or View Replies</button>
                </div>
            `);
        });
        $('#threadPane').show();
    }

    window.setCommentThread = async (id) => {
        currentCommentId = id;
        currentThreadUrl = 'http://localhost:37337/api/comment/reply';
        let comment = await $.ajax({
            url: `http://localhost:37337/api/comment/${currentCommentId}`,
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        });
        $('#threadDisplay').empty();
        comment.replies.forEach(async reply => {
            console.log(reply)
            const user = await $.ajax({
                url: `http://localhost:37337/api/user/${reply.user}`,
                beforeSend: function (xhr) {
                    const userToken = localStorage.getItem('userToken');
                    xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
                }
            });
            $('#threadDisplay').append(`
                <div class="picturePost">
                    <div class="picTitle">${user.email}</div>
                    <p>${reply.text}</p>
                    <div class="picTitle">${reply.replies.length} replies</div>
                    <button onclick="setCommentThread(\'${reply._id}\')" class="photobutton">Reply or view replies</button>
                </div>
            `);
        });
        $('#threadPane').show();
    }

    function newLogin(data) {
        console.log('A new user logged in: ', data)
    }

    function fetchPictures() {
        $.get('http://localhost:37337/api/picture')
        .done((data) => {
            console.log('all pictures: ', {data});
            $('#pictureDisplay').empty();
            data.forEach(picture => {
                $('#pictureDisplay').append(`
                    <div class="picturePost">
                        <div class="picTitle">${picture.user.email}</div>
                        <image class="picImage" src=${picture.url} />
                        <div class="picTitle">${picture.comments.length} comments</div>
                        <button onclick="setPictureThread(\'${picture._id}\')" class="photobutton">Comment or view comments</button>
                    </div>
                `);
            });
        })
        .fail((err) => {
            console.log({err})
            // $('#errorBox').html(err.responseJSON.message);
        });
    }

    async function reloadPictures(picture) {
        let user = await $.ajax({
            url: `http://localhost:37337/api/user/${picture.user}`,
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        });
        console.log(`${user.email} just uploaded a picture`);
        alert(`${user.email} just uploaded a picture`);
        fetchPictures();
    }

    var socket = io();
    socket.on('newConn', console.log);
    socket.on('join', newLogin);
    socket.on('newPicture', reloadPictures);
    socket.emit('login', 'Random user');

    fetchPictures();
});