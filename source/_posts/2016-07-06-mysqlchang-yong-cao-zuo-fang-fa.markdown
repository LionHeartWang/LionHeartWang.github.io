---
layout: post
title: "mysql常用操作方法"
date: 2016-07-06 19:24:22 +0800
comments: true
categories: [技术资源] 
---
本文介绍一些mysql实用操作方法。
<!--more-->

## 启动/登录

安装完毕后，使用如下命令： 

```
$bin/mysqld_safe --user=mysql &
```

启动后即可登录

```
$mysql
```

出现如下登录界面表示启动成功：

![替代文字](https://wt-prj.oss.aliyuncs.com/f552fc42b7f64b5a9a4f288c96eb594c/ef5e6448-0869-44cd-9b49-a1c74d5337df.png)

更一般地，可以登录远程mysql数据库。命令如下：

```
$mysql -h<目标ip/hostname> -u<用户名> -p<密码>
```

## 用户权限管理

一般mysql安装完在本地可以root账户免密码登录。可以为root账户设置密码。

### 设置root账户密码

使用mysqladmin命令设置，形式如下：

```
$mysqladmin -u root password "<新的root密码>"
```

设置完毕后root帐号登录j就需要输入密码：

```
$mysql -uroot -p<新的root密码>
```

### 添加用户

添加新用户并授予权限使用如下语句：

```
mysql> GRANT <权限1, 权限2...> PRIVILEGES ON <授权数据库名>.<授权表名> TO '<用户名>'@'<授权访问的IP>' IDENTIFIED BY '<密码>' WITH GRANT OPTION;
```

其中WITH GRANT OPTION可选，表明该用户是否有权限授予权限。

另外可以使用通配符'*'，'%'，例如如下语句：

```
mysql> GRANT ALL PRIVILEGES ON *.* TO 'wyg'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
```

该语句为用户wyg授权，以123456为密码，具有从任意IP访问所有数据库中所有表的所有权限，并具有授权权限。

## 备份/还原数据库

生产环境中经常需要对数据库进行迁移，这就需要备份/还原数据库。

### 备份数据

使用mysqldump命令，语法如下：

```
$mysqldump -u<用户名> -p<密码> --databases <数据库1，数据库2...> > <输出文件>
```

该语句将指定的database的数据信息备份到输出文件中，输出文件是一个sql文件。

可以用--all-databases 将整个数据库的所有database的数据备份。

### 还原数据

在输出文件的当前目录登录mysql，然后执行：

```
mysql> source <输入文件>
```

执行完成后当前输入文件中的数据信息就录入当前mysql中。

例如，在一台老的数据库机器上执行：

```
$mysqldump -uwyg -p123456 --all-databases > all.sql
```

然后拷贝all.sql到新机器，登录mysql执行:

```
mysql> source all.sql
```

这样就完成了mysql数据从老机器到新机器的迁移。


