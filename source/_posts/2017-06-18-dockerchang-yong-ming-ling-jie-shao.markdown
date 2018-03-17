---
layout: post
title: "Docker常用命令介绍"
date: 2017-06-18 22:52:05 +0800
comments: true
categories: [技术资源,docker] 
---

本文介绍常用的docker命令。

<!--more-->

## 镜像相关

查看本地具有的镜像

```
sudo docker images
```

登录远程镜像仓库

```
docker login <镜像仓库地址>
```

例如：

> docker login test.lionheart.com

命名镜像

```bash
docker tag <镜像id> <镜像仓库地址>/<镜像空间名>/<镜像名>:<镜像tag>
```

命名镜像后可推送镜像到远端仓库：

```bash
docker push <镜像仓库地址>/<镜像空间名>/<镜像名>:<镜像tag>
```

例如：

> docker tag 12ab34cd56ef test.lionheart.com/wangyiguang/dockertest:1.0

> docker push test.lionheart.com/wangyiguang/dockertest:1.0

## 容器相关

启动container：

```bash
sudo docker run -tid --name <镜像名> --net=host -l "<资源配置>" <镜像id> /bin/bash
```

示例：

> sudo docker run -tid --name lionhearttest --net=host  \

> -l "GpuCount=1" -l "PerGpuCache=100000" 12ab34cd56ef /bin/bash

查看所有container：

```bash
sudo docker ps -a
```

```bash
docker tag image_id $image_center_addr/$image_namespace/$IMAGE_NAME:$TAG
```

以当前容器创建镜像：

```bash
sudo docker commit <容器id> <镜像名>
```
