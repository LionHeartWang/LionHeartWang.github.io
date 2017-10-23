---
layout: post
title: "Linux NFS配置及使用方法"
date: 2017-10-24 00:27:55 +0800
comments: true
categories: [技术资源] 
---

NFS是Network  File System（网络文件系统）。主要功能是通过网络让不同的服务器之间可以共享文件或者目录。

本文以CentOS系统为例介绍Linux下NFS的配置和使用方法。

NFS在文件传送过程中依赖与RPC（远程过程调用）协议，配置步骤介绍如下。

<!-- More -->

## 安装软件包

安装nfs软件包，server和client机器都需要安装

```bash
sudo yum -y install nfs-utils nfs-utils-lib
```

## 配置NFS Server

假设用来共享目录的NFS Server机器是192.168.0.1，需要登录该机器配置挂载目录。

登录后编辑/etc/exports文件内容，输入需要挂载的机器IP，以及服务端共享的路径。

假设需要访问NFS共享目录的机器为192.168.0.2 ~ 192.168.0.6，配置/etc/exports如下所示：

```
/path/to/mount 192.168.0.2(rw,sync,no_root_squash)
/path/to/mount 192.168.0.3(rw,sync,no_root_squash)
/path/to/mount 192.168.0.4(rw,sync,no_root_squash)
/path/to/mount 192.168.0.5(rw,sync,no_root_squash)
/path/to/mount 192.168.0.6(rw,sync,no_root_squash)
...
```

其中/path/to/mount根据需要配置为欲挂载的路径即可。
      
## 启动NFS Server

在192.168.0.1上执行如下命令启动NFS Server

```bash
sudo service rpcbind restart
sudo service nfs restart
```

执行如下命令，则会显示挂载的机器IP列表：

```bash
showmount -e 192.168.0.1
```

## 配置NFS Client

分别登陆每台需要挂载的client机器，运行如下命令进行共享文件夹挂载。

```
sudo mkdir /target/to/mount
sudo mount -t nfs 192.168.0.1:/path/to/mount /target/to/mount
```

其中：

- /path/to/mount为之前配置的NFS Server上挂载的路径。
- /target/to/mount为本地机器欲挂载到的目标路径。

挂载完成后，在192.168.0.2 ~ 192.168.0.6上就可以向访问本地路径一样访问192.168.0.1的/path/to/mount目录了。
