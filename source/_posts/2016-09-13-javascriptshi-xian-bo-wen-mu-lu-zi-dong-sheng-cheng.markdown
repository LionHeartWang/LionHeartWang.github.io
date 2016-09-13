---
layout: post
title: "JavaScript实现博文目录自动生成"
date: 2016-09-13 17:16:48 +0800
comments: true
categories: [JavaScript, 前端] 
---
自建的博客站点，常常需要博文目录自动生成的功能，本文介绍一种JavaScript实现的解决方案。

实现参考了 http://www.iyanlei.com/markdown_catelog.html。

<!--more-->

## 目录自动生成

以本站博客的生成代码为例。我们需要借助JQuery实现，因此首先加载JQuery库。

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
```

### 相关HTML

在博文顶部留出一块区域用作目录：

```html
<div class="blogAnchor">
  <p id="anchorContentToggle" title="收起">导航[-]</p>
  <div class="anchorContent" id="anchorContent"> </div>
</div>
```

在博文末尾添加一段JavaScript代码，扫描当前页面的h2~h6元素。

### 使用JQuery生成目录

为每个标题生成一个超链接a元素，添加到anchorContent区域中。

```html
<script src="/javascripts/libs/blogDirectory.js" type="text/javascript"></script>
```

blogDirectory.js具体实现如下：

```javascript
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
```

代码根据标题的级别控制CSS样式表单，对不同的级别的标题使用了不同的缩进。

## 点击收放功能

向blogDirectory.js中添加一段代码，即可实现点击收放功能。

```javascript
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
```

实现的方法就是注册anchorContentToggle元素的点击响应函数。

通过调用anchorContent元素的toggle方法来调整anchorContent的可见性，达到收放的效果。


## 锚点自动跳转

我们希望点击目录中的某个条目，能够跳转到博文中相应的位置，这可以借助锚点实现。

向blogDirectory.js中继续添加代码：

```
$(".anchor-link").click(function(){
    $("html,body").animate({scrollTop: $($(this).attr("link")).offset().top}, 400);
});
```

实现了每个条目的点击响应函数，即跳转到相应的锚点位置，这里使用了JQuery animate方法来实现平滑过渡。

## 样式调节美化

到这里，目录的基本功能已经实现了。我们需要调整一下样式，美化一下目录。

```css
.anchorContent a {
  color: #999;
  font-size: 14px;
  text-decoration: none;
}

.anchorContent a:hover {
  color: $theme-color1;
  font-size: 16px;
  font-weight: bold;
  padding-left: 5px;
}

#anchorContentToggle {
  color: #a61c00;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}
```

这样鼠标扫过相关条目会有字号颜色的改变，起到突出显示的效果。

最终效果如下：

{% img /images/blog/03-blog_directory.png %}
