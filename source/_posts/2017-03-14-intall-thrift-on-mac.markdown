---
layout: post
title: "Mac安装Thrift方法"
date: 2017-03-14 17:25:31 +0800
comments: true
categories: 技术资源
---

新版mac使用brew默认安装的是最新版本的thrift 0.10.1

但现有项目主要依赖0.9.x，因此需要在mac上手动安装thrift。

本文介绍如何在新版本Mac上安装thrift 0.9.3.

<!--more-->

## 安装依赖

确保安装了如下依赖：

- openssl
- libevent
- bison 版本> 2.5

注意：

mac高版本安装openssl之后可能提示openssl为keg-only的版本

需要记下其安装目录，默认为/usr/local/opt/openssl.

## 下载thrift

以0.9.3为例：

```bash
$wget http://archive.apache.org/dist/thrift/0.9.3/thrift-0.9.3.tar.gz
```

下载后解压：

```bash
$tar zxvf thrift-0.9.3.tar.gz
```

## 编译安装thrift

运行configure进行配置，注意这里指定了前面记下的openssl的路径：

```bash
$./configure --with-openssl=/usr/local/opt/openssl --without-perl --without-php
```

编译：

```bash
$./make
```

安装：

```bash
$./make install
```

安装后运行：

```bash
$thrift --version
```

输出：Thrift version 0.9.3

表明<font color=green><b>安装成功</b></font>。
