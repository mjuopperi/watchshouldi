$(function() {
    var tmdbUrl = "https://api.themoviedb.org/3";
    var imageUrl = "https://image.tmdb.org/t/p";
    var posterWidth = "/w500";
    var backdropWidth = "/w1280";

    var movie = $("#movie");
    var error = $("#error");
    $('.svg').inlineSVG();

    var votesRef = new Firebase("https://watchshouldi.firebaseio.com/votes");

    function generateId(length) {
        return new Array(length).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
    }

    function createPoll(id) {
        var pollId = generateId(6)
        var pollRef = votesRef.child(pollId);
        pollRef.set({
            movie_id: id
        });
        window.location = window.location.href + "/vote/" + pollId;
    }

    $("#movie-info").on("click", "#create-poll", function() {
        var movieId = movie.data("id");
        createPoll(movieId);
    });

    var results;

    function backdropUrl(path) {
        return imageUrl + backdropWidth + path;
    }

    function posterUrl(path) {
        return imageUrl + posterWidth + path;
    }

    function showError(errorText) {
        movie.hide();
        error.find("p").text(errorText);
        error.show();
        error.delay(3000).fadeOut(200);
    }

    function renderNotFound() {
        movie.hide();
        showError("Could not find movie. Please try again.")
    }

    function renderMovie(data) {
        $("#ajax-loader").hide();
        results = data.results;
        var firstResult = _.first(results);
        if (typeof firstResult != 'undefined') {
            movie.data("id", firstResult.id);
            getMovieInfo(firstResult.id);
            movie.find("h1").html(firstResult.title);
            setBackdrop(firstResult.backdrop_path);
            setPoster(firstResult.poster_path);
            movie.show();
        } else renderNotFound();
    }

    function setBackdrop(path) {
        var imageUrl = _.isEmpty(path) ? "img/default-backdrop.jpg" :  backdropUrl(path);
        $('<img/>').attr('src', imageUrl).load(function() {
            $(this).remove();
            $("#content").css('background-image', 'url(' + imageUrl + ')');
        });
    }

    function setPoster(path) {
        var imageUrl = _.isEmpty(path) ? "img/default_poster.svg" :  posterUrl(path);
        var moviePoster = movie.find("#poster");
        moviePoster.attr("src", imageUrl);
        moviePoster.show();
    }

    function renderMovieInfo(data) {
        $("#movie-info").html(
            $("<table>").append(
                $("<tr>").append(
                    $("<td>").attr("colspan", 2).append(
                        $("<button>", {
                          id: "create-poll",
                          text: "Create a poll from this movie"
                        })
                    ))).append(
                $("<tr>").append(
                    $("<td>").text("Release date:")).append(
                    $("<td>").text(moment(data.release_date).format("DD.MM.YYYY")))).append(
                $("<tr>").append(
                    $("<td>").text("Runtime:")).append(
                    $("<td>").text(data.runtime + " min"))).append(
                $("<tr>").append(
                    $("<td>").text("Genres:")).append(
                    $("<td>").text(_.map(data.genres, "name").join(", ")))).append(
                $("<tr>").append(
                    $("<td>").text("IMDB:")).append(
                    $("<td>").append("<a href=http://www.imdb.com/title/" + data.imdb_id + ">" + data.imdb_id + "</a>"))))
            .append(
                $("<p>").text(data.overview))
    }

    function renderError() {
        $("#ajax-loader").hide();
        showError("Movie search failed.");
    }

    function getMovieInfo(id) {
        $.ajax({
            url: tmdbUrl + "/movie/" + id,
            type: 'GET',
            data: {
                api_key: "3234cd735a781c6bc9cb637e5dad070d"
            },
            success: renderMovieInfo
        })
    }

    function getMovies() {
        var query = $('#input-search').val();
        if (!_.isEmpty(query)) {
            //clearMovies();
            $("#ajax-loader").show();
            $.ajax({
                url: tmdbUrl + "/search/movie",
                type: "GET",
                data: {
                    query: query,
                    api_key: "3234cd735a781c6bc9cb637e5dad070d"
                },
                success: renderMovie,
                error: renderError
            })
        }
    }

    $("form").submit(function(event){
        event.preventDefault();
        getMovies();
        $('#input-search').val("");
    })
});

