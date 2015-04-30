$(function() {
    $('.svg').inlineSVG();

    var chars = 120;
    $('#remainingChars').html(chars + ' characters remaining');

    $('textarea').keyup(function() {
        var text_length = $('textarea').val().length;
        var text_remaining = chars - text_length;

        $('#remainingChars').html(text_remaining + ' characters remaining');
    });
});

