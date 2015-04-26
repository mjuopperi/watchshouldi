$(function() {
    var omdbUrl = "http://www.omdbapi.com/";
    var movieName = $("#movie h1");
    var moviePoster = $('#movie #poster');
    $('.svg').inlineSVG();
    
    $('form').submit(function(event){
        movieName.html("");
        moviePoster.attr("src", "");
        event.preventDefault();
        $("#ajax-loader").show();
        $.ajax({
            url: omdbUrl,
            type: 'GET',
            data: {
                t: $('#input-search').val(),
                plot: 'short',
                r: 'json'
            },
            success: function(data) {
                $("#ajax-loader").hide();
                movieName.append(data.Title.toUpperCase());
                moviePoster.attr('src', data.Poster);
            }
        })
    })
});

