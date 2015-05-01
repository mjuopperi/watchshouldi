$(function() {
    $('.svg').inlineSVG();

    var chars = 120;
    $('#remainingChars').html(chars);

    $('textarea').keyup(function() {
        var textLength = $('textarea').val().length;
        var charsRemaining = chars - textLength;

        $('#remainingChars').html(charsRemaining);
    });
});

