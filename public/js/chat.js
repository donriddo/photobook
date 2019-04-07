$(() => {
    window.currentPictureId = '';
    window.currentCommentId = '';

    $('#commentButton').click((evt) => {
        evt.preventDefault();
        $.ajax({
            url: 'http://localhost:37337/api/picture/comment/',
            type: 'POST',
            data: { text: $('#commentText').val(), picture: currentPictureId },
            beforeSend: function (xhr) {
                const userToken = localStorage.getItem('userToken');
                xhr.setRequestHeader('Authorization', "Bearer" + " " + userToken);
            }
        })
        .done((data) => {
            console.log({data});
            $('#commentText').val('');
            setPictureThread(currentPictureId);
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
                    <button onclick="setCommentThread(\'${comment._id}\')" class="photobutton">Reply</button>
                </div>
            `);
        });
        $('#threadPane').show();
    }

    window.setCommentThread = async (id) => {
        currentCommentId = id;
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
                    <button onclick="setCommentThread(\'${reply._id}\')" class="photobutton">Reply</button>
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
                        <button onclick="setPictureThread(\'${picture._id}\')" class="photobutton">Post a comment</button>
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