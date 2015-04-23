$(function() {
    var omdbUrl = "http://www.omdbapi.com/";
    $('.svg').inlineSVG();
    $('form').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: omdbUrl,
            type: 'GET',
            data: {
                t: $('#input-search').val(),
                plot: 'short',
                r: 'json'
            },
            success: function(data) {
                console.log(data);
                $('#movie h1').append(data.Title);
                $('#movie img').attr('src', data.Poster);
            }
        })
    })

});
