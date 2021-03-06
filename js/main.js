$(function() {
    var tmdbApiKey = "3234cd735a781c6bc9cb637e5dad070d";
    var tmdbUrl = "https://api.themoviedb.org/3";
    var posterWidth = 500;
    var defaultBackdrop = "default";
    var currentBackdrop;

    var movieDiv = $("#movie");
    var errorDiv = $("#error");
    $('.svg').inlineSVG();

    var votesRef = new Firebase("https://watchshouldi.firebaseio.com/votes");

    function createPoll(id, type) {
        var pollId = generateId(6);
        var pollRef = votesRef.child(pollId);
        pollRef.set({
            id: id,
            type: type
        });
        redirectToPoll(pollId);
    }

    function redirectToPoll(pollId) {
        var url = window.location.href;
        if (url.substr(-1) != '/') url += '/';
        window.location = url + "vote/" + pollId;
    }

    $("#movie-info").on("click", "#create-poll", function() {
        createPoll(movieDiv.data("id"), movieDiv.data("type"));
    });

    var results;

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

    function renderMovieOrShow(data) {
        clearMovie();
        $("#ajax-loader").hide();
        $("#results").hide();
        if (typeof data != 'undefined') {
            movieDiv.data("id", data.id).data("type", data.media_type);
            movieDiv.find("h1").text(nameOrTitle(data));
            getInfo(data);
            setBackdrop(data.backdrop_path);
            setPoster(data.poster_path);
            movieDiv.show();
        } else renderNotFound();
    }

    function shouldChangeBackdrop(path) {
        return !currentBackdrop ||
            (!path && currentBackdrop != defaultBackdrop) ||
            (!!path && !currentBackdrop.endsWith(path))
    }

    function setBackdrop(path) {
        if (shouldChangeBackdrop(path)) {
            if (!_.isEmpty(path)) {
                setBackdropImage(backdropUrl(path));
            } else {
                setDefaultBackdrop();
            }
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

    function setPoster(path) {
        var imageUrl = _.isEmpty(path) ? "img/default_poster.svg" :  posterUrl(path, posterWidth);
        var moviePoster = movieDiv.find("#poster");
        moviePoster.attr("src", imageUrl);
        moviePoster.show();
    }

    function renderInfo(data, type) {
        var table = $("<table>").data("type", type).data("id", data.id);
        table.append(
            $("<tr>").append(
                $("<td>").attr("colspan", 2).append(
                    $("<button>", {
                        id: "create-poll",
                        text: "Create a poll from this movie"
                    })
                )));
        table.append(
            $("<tr>").append(
                $("<td>").text("Release date:")).append(
                $("<td>").text(moment(releaseDate(data)).format("DD.MM.YYYY"))));
        if (type == "movie") {
            table.append(
                $("<tr>").append(
                    $("<td>").text("Runtime:")).append(
                    $("<td>").text(data.runtime + " min")));
        }
        table.append(
            $("<tr>").append(
                $("<td>").text("Genres:")).append(
                $("<td>").text(_.map(data.genres, "name").join(", "))));
        table.appendCast();
        $("#movie-info").html(table).append($("<p>").text(data.overview));
    }

    $.fn.appendCast = function () {
        var elem = $(this).is("table") ? $(this) : $(this).find("table");
        $.ajax({
            url: tmdbUrl + "/" + $(this).data("type") + "/" + $(this).data("id") + "/credits",
            type: "GET",
            data: {
                api_key: tmdbApiKey
            },
            success: function(data) {
                elem.append(
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
            $("#results").find("li").each(function(i) {
                $(this).delay(i * 50).fadeIn(300);
            })
        }
    }

    function renderResult(result) {
        var imageUrl = _.isEmpty(result.poster_path) ? "img/default_poster.svg" :  posterUrl(result.poster_path, 92);
        var elem = $("<li>").css("display", "none").data("type", result.media_type).data("id", result.id).append(
            $("<img>").attr("src", imageUrl)).append(
            $("<div>").append(
                $("<h2>").text(nameOrTitle(result) + " (" + moment(releaseDate(result)).format("YYYY") + ")")).append(
                $("<table>"))
            );
        elem.appendCast();
        elem.click(function() {
            renderMovieOrShow(result);
        });
        return elem;
    }

    function renderError() {
        $("#ajax-loader").hide();
        showError("Movie search failed.");
    }

    function getInfo(data) {
        $.ajax({
            url: tmdbUrl + "/" + data.media_type + "/" + data.id,
            type: 'GET',
            data: {
                api_key: tmdbApiKey
            },
            success: function(info) {
                renderInfo(info, data.media_type)
            }
        })
    }

    function clearMovie() {
        movieDiv.find("h1").text("");
        movieDiv.find("img").attr("src", "");
        movieDiv.find("#movie-info").empty();
    }

    function hideResults() {
        $("#results").hide();
        $("#movie").hide();
    }

    function searchForContent() {
        var query = $('#input-search').val();
        if (!_.isEmpty(query)) {
            hideResults();
            $("#info").hide();
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


    if ($(window).width() < 1000) {
        $("#header").find("h1").text("WSI");
    }

    $(window).resize(function() {
        if ($(window).width() < 1000) {
            $("#header").find("h1").text("WSI");
        } else {
            $("#header").find("h1").text("WatchShouldI");
        }
    });
});

