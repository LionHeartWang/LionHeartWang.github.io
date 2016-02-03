---
layout: post
title: "使用Octopress搭建Github博客"
date: 2016-02-03 11:42:56 +0800
comments: true
categories: 技术资源
---
本文介绍如何使用Octopress搭建Github博客。


## Octopress安装与配置
### 安装ruby
查看ruby版本

~~~
ruby --version  # 必须显示1.9.3
~~~

安装方法：

~~~
$curl -L https://get.rvm.io | bash -s stable --ruby
$rvm install 1.9.3
$rvm use 1.9.3
$rvm rubygems latest
~~~

若有显示命名未找到，直接下载安装即可。

### 安装octopress

在安装octopress之前，确保已安装git。

~~~
 $git clone git://github.com/imathis/octopress.git octopress
 $cd octopress
 $gem install bundler
 $bundle install
 $rake install
~~~

## 建立Github主页

需要注册Github账户。登录后在GitHub上创建一个仓库。仓库名称：username.github.io

### 博客生成
博客的源码放到source分支下，并把生成的内容提交到master分支。
在octopress目录下使用如下命令生成博客内容。

~~~
$rake generate //生成
~~~


### 博客预览

可使用如下命令在本地预览生成效果。

~~~
$rake preview //预览
~~~

执行成功后可通过本地浏览器在http://localhost:4000查看到先前生成的博客内容。

### 博客发布
如果预览没有问题，想要发布博客到Github主页。
首先执行如下命令：

~~~
$rake setup_github_pages
~~~

执行后要求输入仓库的url，可以在Github仓库内容页面找到项目的ssh或http URL链接。

如：git@github.com:username/username.github.io.git


直接复制粘贴该链接即可。

上述操作设置了发布的目标位置为用户Github主页。

~~~
$rake deploy 
$git add .
$git commit -m "comment"
$git push origin source
~~~
生成后的博客文件存放在_deploy目录下, 通过上述操作提交到Github博客项目。

至此就能够在username.github.io上看到了博客内容了。

## 发布新文章

发布新文章时可使用如下命令：

~~~
$rake new_post["title"]
~~~

生成的新文章在source/_post/目录下，文件名构成为时间和标题的拼接。

后续发布操作依然是执行

~~~
$rake generate
$rake preview
~~~

此时可以预览文章，然后执行

~~~
$rake deploy 
$git add .
$git commit -m "comment"
$git push origin source
~~~

此时在Github博客主页就能看到新发布的文章了。


