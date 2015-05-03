$(function() {
    $(".svg").inlineSVG();

    var chars = 120;
    $("#remainingChars").html(chars);

    $("textarea").keydown(function() {
        var textLength = $("textarea").val().length;
        var charsRemaining = chars - textLength;

        $("#remaining-chars").html(charsRemaining);
    });
});

