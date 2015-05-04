$(function() {
    var tmdbApiKey = "3234cd735a781c6bc9cb637e5dad070d";
    var tmdbUrl = "https://api.themoviedb.org/3";
    var posterWidth = 500;
    var defaultBackdrop = "default";
    var currentBackdrop;

    var pollId = window.location.pathname.split('/').pop();
    var pollRef = new Firebase("https://watchshouldi.firebaseio.com/votes/" + pollId);
    var votesRef = pollRef.child("votes");
    var commentsRef = pollRef.child("comments");
    var usersRef = new Firebase("https://watchshouldi.firebaseio.com/users");
    var chars = 200;
    var charsRemaining;
    
    autosize($('textarea'));
    $("#input-comment").val("");

    pollRef.once("value", function(dataSnapshot) {
        var poll = dataSnapshot.exportVal();
        getMovieOrShow(poll["type"], poll["id"])
    });

    function getMovieOrShow(type, id) {
        $("#ajax-loader").show();
        $.ajax({
            url: tmdbUrl + "/" + type + "/" + id,
            type: 'GET',
            data: {
                api_key: tmdbApiKey
            },
            success: function (info) {
                renderMovieOrShow(info)
            }
        });
    }

    function renderMovieOrShow(info) {
        $("#ajax-loader").hide();
        $("#movie").find("h1").text(nameOrTitle(info) + " (" + moment(releaseDate(info)).format("YYYY") + ")");
        setPoster(info.poster_path);
        setBackdrop(info.backdrop_path);
        $("#movie").fadeIn(500);
    }

    function setPoster(path) {
        var imageUrl = _.isEmpty(path) ? "/img/default_poster.svg" :  posterUrl(path, posterWidth);
        var moviePoster = $("#poster");
        moviePoster.attr("src", imageUrl);
        moviePoster.show();
    }

    function setBackdrop(path) {
        if (!_.isEmpty(path)) {
            setBackdropImage(backdropUrl(path));
        } else {
            setDefaultBackdrop();
        }
    }

    function setBackdropImage(url) {
        currentBackdrop = url;
        var backdrop = $("#backdrop");
        backdrop.fadeOut();
        $("<img/>").attr("src", url).load(function() {
            $(this).remove();
            backdrop.hide();
            backdrop.css("background-image", "url(" + url + ")").fadeIn(500);
        });
    }

    function setDefaultBackdrop() {
        currentBackdrop = defaultBackdrop;
        $("#backdrop").fadeOut(400, function() {
            $(this).css("background-image", "");
        }).fadeIn(500);
    }

    getComments(commentsRef);

    $(".svg").inlineSVG();

    $("#remainingChars").html(chars);

    $("textarea").bind("input change", updateRemainingCharacters);

    function updateRemainingCharacters() {
        var textLength = $("textarea").val().length;
        charsRemaining = chars - textLength;
        $("#remaining-chars").html(charsRemaining);
        if (event.keyCode == 13) { $("#comments-container form").submit() }
    }

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
        commentsRef.push({
            username: localStorage.username,
            comment: $("#input-comment").val(),
            time: moment().format()
        });
        $("#input-comment").val("");
        charsRemaining = chars;
        $("#remaining-chars").html(charsRemaining);
    });

    function upvote() {
        $("#up-vote").addClass("selected");
        $("#down-vote").removeClass("selected");
        votesRef.child(localStorage.userid).set(1)
    }

    function downvote() {
        $("#down-vote").addClass("selected");
        $("#up-vote").removeClass("selected");
        votesRef.child(localStorage.userid).set(-1)
    }

    function unvote() {
        $("#up-vote").removeClass("selected");
        $("#down-vote").removeClass("selected");
        votesRef.child(localStorage.userid).remove();
    }

    $("#up-vote").click(function() {
        if ($(this).hasClass("selected")) {
            unvote();
        } else {
            upvote();
        }
    });

    $("#down-vote").click(function() {
        if ($(this).hasClass("selected")) {
            unvote();
        } else {
            downvote();
        }
    });

    function updatePoll(dataSnapshot) {
        var votes = _(dataSnapshot.exportVal());
        var upvotes = votes.filter(function(vote) { return vote > 0 });
        var totalVotes = votes.size();
        var totalUpvotes = upvotes.size();
        $("#poll-status").animate({width: (100 * totalUpvotes / totalVotes) + "%"}, 500);
        $("#poll-numbers").text(totalUpvotes + " / " + (totalVotes - totalUpvotes));
        if (totalVotes > 0) $("#votes").find(".poll").css("background-color", "#f44336");
        else $("#votes").find(".poll").css("background-color", "#dadada");
    }

    function setInitialSelection(dataSnapshot) {
        var votes = dataSnapshot.exportVal();
        if (!!votes &&  localStorage.userid in votes) {
            if (votes[localStorage.userid] > 0) $("#up-vote").addClass("selected");
            else $("#down-vote").addClass("selected");
            $("#votes").find(".poll").css("background-color", "#f44336");
        }
    }

    votesRef.once("value", function(dataSnapshot) {
        setInitialSelection(dataSnapshot);
        votesRef.on("value", function(dataSnapshot) {
            updatePoll(dataSnapshot);
        });
    })
});

function getComments(commentsRef) {
    commentsRef.orderByChild("comments").on("child_added", function(data) {
        $("#comments").prepend('<div class="comment-box">' +
            '<div class="comment-head">' +
            '<div class="comment-name">' + data.val().username + '<span><abbr class="timeago" title="'+ data.val().time +'"></abbr></span></div>' +
            '</div>' +
            '<div class="comment-content">' + data.val().comment + '</div>' +
            '</div>'
        )
        $(".comment-box").slideDown(200);
        $("abbr.timeago").timeago();
    })
}


