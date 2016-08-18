---
layout: post
title: "免密码远程登录/拷贝方法"
date: 2016-08-18 15:41:28 +0800
comments: true
categories: 技术资源
---
生产环境中尝尝需要在机器间建立信任关系，远程登录或拷贝大量数据，本文介绍非如何快速免密码登录机器或拷贝数据。
<!--more-->

## 生成密钥

设有源机器 A，目标机器 B。现需要从A免密码登录B，或从B拷贝数据到A。

首先需要生成密钥。登录A机器，执行

```
$ssh-keygen -t rsa
```

一路回车到底。这时在A主机~/.ssh目录下生成了私钥id_rsa以及陪对的id_rsa.pub公钥文件。

## 复制公钥

接下来把公钥复制到远程主机B。

即把公钥id_rsa.pub追加写入到机器B的 ~/.ssh/authorized_keys文件中即可。

执行如下命令：

```
$cat ~/.ssh/id_rsa.pub | ssh user@host "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

如有多台远程主机多次复制即可。

此时已经可以免密码从B拷贝数据到A或从A ssh登录到B。

如果机器A和B用户一致的话，就可以直接从A ssh hostname 直接登陆B。

若不一致则可通过ssh username@hostname登录。

## 配置ssh

对于本地机器用户和远程登录用户名不同的情况可通过修改本地登陆用户的 ~/.ssh/config 文件解决。

向 ~/.ssh/config 中添加内容如下：

```
Host 机器B的hostname
user 登录用户名
...
```

这样，本地机器A和远程机器B用户名不一致也可 ssh hostname 免密码直接登陆。
