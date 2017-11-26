---
layout: post
title: "使用Landslide基于MarkDown制作在线Slide"
date: 2017-11-26 19:05:19 +0800
comments: true
categories: [技术资源]
---

本文介绍使用Landslide工具基于Markdown语法制作在线Slide的方法。
<!-- More -->

## Landsilde工具使用

Landslide是基于Google的``html5slides``的一个Slide生成工具，可将markdown、ReST 或者 textile文件转化成HTML5的slide。

该转化支持内联模式，即生成一个具有完整功能的HTML文件，将依赖的css等东西放入其中，很容易用来分享。

类似的还有工具还有 remark，相关gitlab项目主页：

- https://github.com/adamzap/landslide
- https://github.com/gnab/remark/

### 安装landslide
 
  方案一 pip安装：
  
  ```bash
 $ pip install landslide
 ```
 方案二 源码安装：
 
 ```bash
$ git clone https://github.com/adamzap/landslide.git
$ cd landslide
$ python setup.py build
$ sudo python setup.py install
 ```
 
### Markdown书写Slide内容
 
以markdown语法书写，可以参考landslide提供的示例：

- https://github.com/adamzap/landslide/blob/master/examples/markdown/slides.md

### 生成PPT页面

以官方提供的markdown文本为例，文件命名为test.md，完成后执行如下命令生成HTML内容：

```bash
$ landslide file.md -i -o > test.html
```

命令行参数说明详见下文介绍。

可以直接在浏览器中打开观察效果：

```bash
open test.html
```

支持快捷键，可左右切换slide，详见下文快捷键介绍。

{% img /images/blog/06-landslide_demo.png %}

## 使用PrinceXML生成PDF

PrinceXML是一款将html转换为pdf的工具，提供免费带水印版试用。

下载地址：

- http://www.princexml.com/download/

选择对应版本解压后执行脚本安装：

```bash
$ sh insatll.sh
```

指定路径安装完毕后即可使用prince命令。

```bash
$ prince test.html -o test.pdf
```

即可生成需要的PDF PPT文件。

## Landslide快捷键及命令参数介绍

### PPT页面快捷键

快捷键如下：

> Press h to toggle display of help

> Press left arrow and right arrow to navigate

> Press t to toggle a table of contents for your presentation. Slide titles are links

> Press ESC to display the presentation overview (Exposé)

> Press n to toggle slide number visibility

> Press b to toggle screen blanking

> Press c to toggle current slide context (previous and next slides)

> Press e to make slides filling the whole available space within the document body

> Press S to toggle display of link to the source file for each slide

> Press '2' to toggle notes in your slides (specify with the .notes macro)

> Press '3' to toggle pseudo-3D display (experimental)

> Browser zooming is supported

### 命令行参数介绍

landslide命令行参数介绍如下：

```
-h, --help            show this help message and exit
-c, --copy-theme      Copy theme directory into current presentation source directory
-b, --debug           Will display any exception trace to stdin
-d FILE, --destination=FILE
                      The path to the to the destination file: .html or .pdf
                      extensions allowed (default: presentation.html)
-e ENCODING, --encoding=ENCODING
                      The encoding of your files (defaults to utf8)
-i, --embed     Embed stylesheet and javascript contents,
                      base64-encoded images in presentation to make a
                      standalone document
-l LINENOS, --linenos=LINENOS
                      How to output linenos in source code. Three options
                      availables: no (no line numbers); inline inside pre tag
                      table (lines numbers in another cell, copy-paste friendly)
-o, --direct-output   Prints the generated HTML code to stdin; won't work with PDF export
-q, --quiet           Won't write anything to stdin (silent mode)
-r, --relative   Make your presentation asset links relative to current
                      pwd; This may be useful if you intend to publish your
                      html presentation online.
-t THEME, --theme=THEME
                      A theme name, or path to a landlside theme directory
-v, --verbose  Write informational messages to stdin (enabled by default)
-w, --watch    Watch the source directory for changes and auto-regenerate the presentation
-x EXTENSIONS, --extensions=EXTENSIONS
                      Comma-separated list of extensions for Markdown
-m, --math-output     Enable mathematical output using mathjax
```


