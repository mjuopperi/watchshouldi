$(function() {
    var tmdbUrl = "https://api.themoviedb.org/3";
    var imageUrl = "https://image.tmdb.org/t/p";
    var posterWidth = "/w500";
    var backdropWidth = "/original";

    var movie = $("#movie");
    var error = $("#error");
    $('.svg').inlineSVG();

    var results;

    function backdropUrl(path) {
        return imageUrl + backdropWidth + path;
    }

    function posterUrl(path) {
        return imageUrl + posterWidth + path;
    }

    function showError(errorText) {
        error.find("p").text(errorText);
        error.show();
        error.delay(3000).fadeOut(200);
    }

    function renderNotFound() {
        showError("Could not find movie. Please try again.")
    }

    function renderMovie(data) {
        $("#ajax-loader").hide();
        results = data.results;
        console.log("data:", data);
        var firstResult = _.first(results);
        if (typeof firstResult != 'undefined') {
            movie.find("h1").append(firstResult.title);
            // TODO: Check if poster exists and show placeholder if not
            var moviePoster = movie.find("img");
            moviePoster.attr("src", posterUrl + "/w" + posterWidth + firstResult.poster_path);
            moviePoster.fadeIn(200);
        } else renderNotFound();
        $('#input-search').val("");
    }

    function renderError() {
        $("#ajax-loader").hide();
        showError("Movie search failed.");
    }

    function clearMovies() {
        movie.find("img").hide();
        movie.find("h1").text("");
    }

    $('form').submit(function(event){
        clearMovies();
        event.preventDefault();
        $("#ajax-loader").show();
        $.ajax({
            url: tmdbUrl + "/search/movie",
            type: 'GET',
            data: {
                query: $('#input-search').val(),
                api_key: "3234cd735a781c6bc9cb637e5dad070d"
            },
            success: renderMovie,
            error: renderError
        })
    })
});

