$(function() {
    var omdbUrl = "http://www.omdbapi.com/";
    $('.svg').inlineSVG();
    
    $('form').submit(function(event){
        event.preventDefault();
        $("#circularG").show();
        $.ajax({
            url: omdbUrl,
            type: 'GET',
            data: {
                t: $('#input-search').val()               ,
                plot: 'short',
                r: 'json'
            },
            success: function(data) {
                $("#circularG").hide();
                $('#movie h1').append(data.Title.toUpperCase());
                $('#movie img').attr('src', data.Poster);
            }
        })
    })
});

