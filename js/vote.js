$(function() {
    $(".svg").inlineSVG();

    var usersRef = new Firebase("https://watchshouldi.firebaseio.com/users");

    var chars = 120;
    $("#remainingChars").html(chars);

    $("textarea").keydown(function() {
        var textLength = $("textarea").val().length;
        var charsRemaining = chars - textLength;

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
});

