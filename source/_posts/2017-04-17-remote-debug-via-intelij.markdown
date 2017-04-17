---
layout: post
title: "使用InteliJ远程调试程序"
date: 2017-04-17 18:50:33 +0800
comments: true
categories: 技术资源 
---

本文介绍如何使用InteliJ远程调试Java/Scala程序。

<!--more-->

## 以调试模式启动程序

JVM添加如下启动参数：

```bash
JAVA_DEBUG_OPTS="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=<debugPort>"
java $JAVA_DEBUG_OPTS <className>
```

其中：

- debugPort为调试服务端口，供InteliJ调试器连接，后面会用到。
- className为待执行的程序类。

启动后会提示如下信息：

> Listening for transport dt_socket at address: xxxx

## 调试器远程连接

在InteliJ菜单选择``Run`` -> ``Edit Configuration``，进入运行配置界面。

选择``+``添加一项新的配置，内容如下图所示：

{% img /images/blog/04-remoteDebug01.png %}

填好配置名称，IP、端口即可。IP、端口要和之前远程启动的程序一致。

然后就可以在源码中设置断点，在InteliJ中进行调试了。

{% img /images/blog/05-remoteDebug02.png %}




