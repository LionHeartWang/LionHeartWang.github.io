$(".entry-content").find("h2,h3,h4,h5,h6").each(function(i, item) {
  var tag = $(item).get(0).localName;
  $(item).attr("id", "wow" + i);
  $("#anchorContent").append(
		'<p><a class = "title-' + tag + 
		' anchor-link" onclick = "return false;" href = "#" link = "#wow' + i +
		'">' + $(this).text() + '</a></p>');
  $(".title-h2").css("margin-left", 0);
  $(".title-h3").css("margin-left", 20);
  $(".title-h4").css("margin-left", 40);
  $(".title-h5").css("margin-left", 60);
  $(".title-h6").css("margin-left", 80);
});

$("#anchorContentToggle").click(function(){
    var text = $(this).html();
    if(text=="导航[-]"){
        $(this).html("导航[+]");
        $(this).attr({"title":"展开"});
    }else{
        $(this).html("导航[-]");
        $(this).attr({"title":"收起"});
    }
    $("#anchorContent").toggle();
});

$(".anchor-link").click(function(){
    $("html,body").animate({scrollTop: $($(this).attr("link")).offset().top}, 400);
});

