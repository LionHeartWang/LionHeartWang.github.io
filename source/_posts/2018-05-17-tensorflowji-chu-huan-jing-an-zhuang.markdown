---
layout: post
title: "Tensorflow基础环境安装"
date: 2018-05-17 16:24:53 +0800
comments: true
categories: [Tensorflow, 技术资源] 
---

本文介绍如何搭建tensorflow的基础运行环境，包括Cuda、Cudnn与tensorflow gpu版本的安装。

<!-- More -->

## 安装Cuda

在nvida官网寻找Cuda rpm安装包：

-  https://developer.nvidia.com/cuda-downloads

选择对应版本和系统后下载。

以Cuda 9.0为例，下载后的安装包为：

- cuda-repo-rhel7-9-0-local-9.0.176-1.x86_64.rpm

执行如下命令安装：

```bash
sudo rpm -i cuda-repo-rhel7-9-0-local-9.0.176-1.x86_64.rpm
sudo yum clean all
sudo yum install cuda`
```

安装nvida-driver：

```bash
sudo yum install -y nvidia-kmod cuda-drivers
```

重新加载nvidia相关模块：

```bash
sudo rmmod nvidia-uvm
sudo rmmod nvidia
sudo nvidia-modprobe -u -c=0
```

检验新的驱动是否生效，运行

```bash
nvidia-smi
```

应当输出本机GPU信息。

## 安装Cudnn

在nvidia官网寻找Cudnn安装包：

- https://developer.nvidia.com/rdp/cudnn-download

根据Cuda版本与系统选择对应版本下载。

以Cudnn 7.0为例，下载后的安装包为：

- cudnn-9.0-linux-x64-v7.tgz

解压安装操作如下：

```bash
tar zxvf cudnn-9.0-linux-x64-v7.tgz
sudo cp cuda/include/cudnn.h /usr/local/cuda/include
sudo cp cuda/lib64/libcudnn* /usr/local/cuda/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn.h /usr/local/cuda/lib64/libcudnn*
```

设置环境变量：

```
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
```

## 安装Tensorflow

通过pip安装GPU版本的tensorflow。

```
pip install tensorflow-gpu
```

在python中测试tensorflow是否能够正常加载。

```python
import tensorflow as tf
print tf.__version__
```

目前最新版本为1.8.0

