---
layout: post
title: "使用Octopress搭建Github博客"
date: 2016-02-03 11:42:56 +0800
comments: true
categories: 技术资源
---
本文介绍如何使用Octopress搭建Github博客。
<!--more-->

## Octopress安装与配置

### 安装ruby

查看ruby版本

```bash
ruby --version  # 必须显示1.9.3
```

安装方法：

```bash
$curl -L https://get.rvm.io | bash -s stable --ruby
$rvm install 1.9.3
$rvm use 1.9.3
$rvm rubygems latest
```

若有显示命名未找到，直接下载安装即可。

### 安装octopress

在安装octopress之前，确保已安装git。

```bash
 $git clone git://github.com/imathis/octopress.git octopress
 $cd octopress
 $gem install bundler
 $bundle install
 $rake install
```

## 建立Github主页

需要注册Github账户。登录后在GitHub上创建一个仓库。仓库名称：username.github.io

### 博客生成
博客的源码放到source分支下，并把生成的内容提交到master分支。
在octopress目录下使用如下命令生成博客内容。

```bash
$rake generate //生成
```


### 博客预览

可使用如下命令在本地预览生成效果。

```bash
$rake preview //预览
```

执行成功后可通过本地浏览器在 http://localhost:4000 查看到先前生成的博客内容。

### 博客发布
如果预览没有问题，想要发布博客到Github主页。
首先执行如下命令：

```bash
$rake setup_github_pages
```

执行后要求输入仓库的url，可以在Github仓库内容页面找到项目的ssh或http URL链接。

如：git@github.com:username/username.github.io.git


直接复制粘贴该链接即可。

上述操作设置了发布的目标位置为用户Github主页。

```bash
$rake deploy 
$git add .
$git commit -m "comment"
$git push origin source
```
生成后的博客文件存放在_deploy目录下, 通过上述操作提交到Github博客项目。

至此就能够在username.github.io上看到了博客内容了。

## 发布新文章

发布新文章时可使用如下命令：

```bash
$rake new_post["title"]
```

生成的新文章在source/_post/目录下，文件名构成为时间和标题的拼接。

后续发布操作依然是执行

```bash
$rake generate
$rake preview
```

此时可以预览文章，然后执行

```bash
$rake deploy 
$git add .
$git commit -m "comment"
$git push origin source
```

此时在Github博客主页就能看到新发布的文章了。

## 迁移博客

如果更换电脑，那么需要重新从github上下载博客的源码, 并重新下载依赖。

### 重新下载博客源码

首先重新从github上下载博客的源码，执行：

```bash
$git clone -b source git@github.com:username/username.github.io.git
```

下载到本地后进入项目目录，然后执行：

```bash
$git clone git@github.com:username/username.github.io.git _deploy
```

### 重新下载依赖

需要重新安装gem，然后执行：

```bash
$gem install bundler
$bundle install
```

注意：

- 由于以前已经建立好工程，因此<b><font color=red>无需运行rake install</font></b>。
- 如果运行反而会冲掉之前设置好的theme。

### 重新生成博文

执行：

```bash
$rake generate
$rake preview
```

在本地4000端口可以看到博客预览，同Github博客主页的应当是相同的。

后续就可以在新电脑上更新发布博文了。
