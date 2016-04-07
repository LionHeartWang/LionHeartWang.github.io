---
layout: post
title: "非Root账户快速安装mySQL"
date: 2016-04-07 21:37:37 +0800
comments: true
categories: 技术资源 
---
生产环境中尝尝需要使用mySQL，但线上机器往往工作在非root账户下，没有root密码也不能使用sudo。

本文介绍非Root账户如何快速安装mySQL。
<!--more-->

## 下载安装MYSQL
 
从官网下载mySQL二进制包： mySQL 5.5.48
下载后解压进入目录

```
$tar zxvf mysql-5.5.48-linux2.6-x86_64.tar.gz
$cd mysql-5.5.48-linux2.6-x86_64
```
执行       

```
$./scripts/mysql_install_db --defaults-file=/home/wyg/work/mysql/my.cnf \
  --user=wyg --basedir=/home/wyg/work/mysql/mysql-5.5.48-linux2.6-x86_64 \
  --datadir=/home/wyg/work/mysql/sql_data --socket=/tmp/mysql.sock
```
 
## 配置MYSQL
 
创建配置文件my.cnf如下

```
[client]
password       = your_password
port            = 3306
socket = /tmp/mysql.sock
[server]
user = wyg
basedir = /home/wyg/work/mysql/mysql-5.5.48-linux2.6-x86_64
datadir = /home/wyg/work/mysql/sql_data
socket = /tmp/mysql.sock
port = 3306
```
 
## 启动MYSQL

执行如下命令启动mysql服务

```
$./mysqld --defaults-file=/home/wyg/work/mysql/my.cnf &
``` 

随后执行mysq命令

```
$mysql
```
如果进入mysql客户端，则安装成功。

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 5.5.48 MySQL Community Server (GPL)
Copyright (c) 2000, 2016, Oracle and/or its affiliates. All rights reserved.
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql>
```

配置环境变量将mysql-5.5.48-linux2.6-x86_64/bin目录添加到path，即可正常使用mysql命令。
