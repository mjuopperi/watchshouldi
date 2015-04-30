$(function() {
    var tmdbApiKey = "3234cd735a781c6bc9cb637e5dad070d";
    var tmdbUrl = "https://api.themoviedb.org/3";
    var imageUrl = "https://image.tmdb.org/t/p";
    var posterWidth = 500;
    var backdropWidth = "/w1280";

    var movieDiv = $("#movie");
    var errorDiv = $("#error");
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
        redirectToPoll(pollId);
    }

    function redirectToPoll(pollId) {
        var url = window.location.href;
        if (url.substr(-1) != '/') url += '/';
        window.location = url + "vote/" + pollId;
    }

    $("#movie-info").on("click", "#create-poll", function() {
        var movieId = movieDiv.data("id");
        createPoll(movieId);
    });

    var results;

    function backdropUrl(path) {
        return imageUrl + backdropWidth + path;
    }

    function posterUrl(path, width) {
        return imageUrl + "/w" + width + path;
    }

    function imdbUrl(imdbId) {
        return "http://www.imdb.com/title/" + imdbId;
    }

    function nameOrTitle(data) {
        if("name" in data) return data.name;
        else return data.title;
    }

    function releaseData(data) {
        if ("first_air_date" in data) return data.first_air_date;
        else return data.release_date;
    }

    function showError(errorText) {
        movieDiv.hide();
        errorDiv.find("p").text(errorText);
        errorDiv.show();
        errorDiv.delay(3000).fadeOut(200);
    }

    function renderNotFound() {
        movieDiv.hide();
        showError("Could not find movie. Please try again.")
    }

    function renderMovie(movie) {
        $("#ajax-loader").hide();
        $("#results").hide();
        if (typeof movie != 'undefined') {
            movieDiv.data("id", movie.id);
            movieDiv.find("h1").html(movie.title);
            getMovieInfo(movie.id);
            setBackdrop(movie.backdrop_path);
            setPoster(movie.poster_path);
            movieDiv.show();
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
        var imageUrl = _.isEmpty(path) ? "img/default_poster.svg" :  posterUrl(path, posterWidth);
        var moviePoster = movieDiv.find("#poster");
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
                    $("<td>").append("<a href=" + imdbUrl(data.imdb_id) + ">" + data.imdb_id + "</a>"))))
            .append(
                $("<p>").text(data.overview))
    }

    $.fn.appendCast = function () {
        var elem = $(this).find("table");
        $.ajax({
            url: tmdbUrl + "/" + $(this).data("type") + "/" + $(this).data("id") + "/credits",
            type: "GET",
            data: {
                api_key: tmdbApiKey
            },
            success: function(data) {
                elem.html(
                    $("<tr>").append(
                        $("<td>").text("Cast:")).append(
                        $("<td>").text(_(data.cast).sortBy("order").take(4).map("name").value().join(", ")))).append(
                    $("<tr>").append(
                        $("<td>").text("Crew:")).append(
                        $("<td>").text(_(data.crew).take(4).map("name").value().join(", ")))
                );
            }
        })
    };

    function renderResults(data) {
        $("#ajax-loader").hide();
        results = _(data.results).filter(function(r) { return r.media_type != "person" })
            .sortByOrder(["popularity"], [false]).value();
        if (_.isEmpty(results)) renderError();
        else {
            setBackdrop(_.first(results).backdrop_path);
            $("#results").html(
                $("<ul>").append(
                    _.map(results, renderResult)
                )
            ).show();
        }
    }

    function renderResult(result) {
        var imageUrl = _.isEmpty(result.poster_path) ? "img/default_poster.svg" :  posterUrl(result.poster_path, 92);
        var elem = $("<li>").data("type", result.media_type).data("id", result.id).append(
            $("<img>").attr("src", imageUrl)).append(
            $("<div>").append(
                $("<h2>").text(nameOrTitle(result) + " (" + moment(releaseData(result)).format("YYYY") + ")")).append(
                $("<table>"))
            );
        elem.appendCast();
        elem.click(function() {
            renderMovie(result);
        });
        return elem;
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
                api_key: tmdbApiKey
            },
            success: renderMovieInfo
        })
    }

    function hideResults() {
        $("#results").hide();
        $("#movie").hide();
    }

    function searchForContent() {
        var query = $('#input-search').val();
        if (!_.isEmpty(query)) {
            hideResults();
            $("#ajax-loader").show();
            $.ajax({
                url: tmdbUrl + "/search/multi",
                type: "GET",
                data: {
                    query: query,
                    api_key: tmdbApiKey
                },
                success: renderResults,
                error: renderError
            })
        }
    }

    $("form").submit(function(event){
        event.preventDefault();
        searchForContent();
        $("#input-search").val("");
    });
});

