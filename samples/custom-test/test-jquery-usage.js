$(document).ready(function() {
    $("#btn").click(function() {
        $.ajax({ url: "/api/data" });
    });
});

jQuery(".item").on("click", function() {
    console.log("clicked");
});
