$(function() {
    $(".svg").inlineSVG();

    var url = window.location.href;
    var voteId = url.replace("https://watchshouldi.firebaseio.com/votes/", "");
    var usersRef = new Firebase("https://watchshouldi.firebaseio.com/users");
    voteId = "7YNzvy";
    var commentsRef = new Firebase("https://watchshouldi.firebaseio.com/votes/" + voteId + "/comments");
    var chars = 120;
    var charsRemaining;

    getComments(commentsRef);

    $("#remainingChars").html(chars);
    $("textarea").keyup(function() {
        var textLength = $("textarea").val().length;
        charsRemaining = chars - textLength;
        $("#remaining-chars").html(charsRemaining);
    });

    function createUser(username) {
        var userRef = usersRef.push({
            name: username
        });
        localStorage.userid = userRef.key();
        localStorage.username = username;
    }

    function userExists() {
        return typeof localStorage.username != "undefined"
    }

    if (!userExists()) {
        $("#modal").css('visibility', 'visible');
        $("#name-form").submit(function (event) {
            event.preventDefault();
            createUser($("#username").val());
            $("#modal").fadeOut(500);
        });
    }

    $("#comments-container form").submit(function(event) {
        event.preventDefault();
        commentsRef.push({ 'username': localStorage.username, 'comment': $("#input-comment").val(), 'time': moment().format("dddd, MMMM Do YYYY, h:mm:ss a") });
        $("#input-comment").val("");
        charsRemaining = chars;
        $("#remaining-chars").html(charsRemaining);
    })
});

function getComments(commentsRef) {moment([2007, 0, 29]).fromNow()
    commentsRef.orderByChild("comments").on("child_added", function(data) {
        $("#comments").prepend('<div class="comment-box">' +
            '<div class="comment-head">' +
            '<div class="comment-name">' + data.val().username + '<span>' + data.val().time + '</span></div>' +
            '</div>' +
            '<div class="comment-content">' + data.val().comment + '</div>' +
            '</div>'
        )
        $(".comment-box").slideDown(200);
    })
}


