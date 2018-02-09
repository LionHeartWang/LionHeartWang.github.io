---
layout: post
title: "搭建Ray集群步骤"
date: 2018-02-08 10:29:16 +0800
comments: true
categories: [大数据, Ray] 
---
本文介绍如何搭建Ray 0.3集群环境。

可参考官方文档：

- https://ray.readthedocs.io/en/latest/using-ray-on-a-cluster.html

<!-- More -->
 
## 安装Ray

首先在每台机器上安装如下组件。

###  安装Anaconda

首先安装Anaconda，下载：

- Anaconda2-4.3.0-Linux-x86_64.sh

按提示执行安装即可。

### 安装Ray依赖

ray依赖如下库：

- six (>=1.0.0)
- redis
- pytest
- psutil
- numpy
- funcsigs
- flatbuffers
- colorama
- cloudpickle (==0.5.2)
- click

注意：

- 如果机器环境通pip源则直接pip install即可。
- 如果不通可以在 https://pypi.python.org/pypi/ray/0.3.0 下载.whl包后上传到机器pip本地安装。

### 安装Ray 0.3

如果环境通pip源

```bash
$ pip install ray
```

如果不通则在 https://pypi.python.org/pypi/ray/0.3.0 下载 ：

- ray-0.3.0-cp27-cp27mu-manylinux1_x86_64.whl

然后执行：

```bash
$ pip install ray-0.3.0-cp27-cp27mu-manylinux1_x86_64.whl
```

## 搭建集群

假设集群IP如下：

```
192.168.0.1
192.168.0.2
192.168.0.3
192.168.0.4
192.168.0.5
192.168.0.6
192.168.0.7
192.168.0.8
192.168.0.9
192.168.0.10
```

搭建集群环境如下：

### 启动Head节点

选一个节点作为Head节点，例如IP为：

```
192.168.0.1
```

在head节点执行：

```bash
ray start --head --node-ip-address 192.168.0.1 --redis-port=6379
```

执行后会启动Head节点相关的服务。

### 启动Worker节点

Worker节点IP为：

```bash
192.168.0.2
192.168.0.3
192.168.0.4
192.168.0.5
192.168.0.6
192.168.0.7
192.168.0.8
192.168.0.9
192.168.0.10
```

在每台Worker节点上执行：

```bash
ray start --redis-address :6379 192.168.0.x --num-cpus 10
```

执行后会启动Worker节点相关服务，其中：

- 192.168.0.x 为对应节点IP
- num-cpu选项可以用于设置每台节点可用的cpu数，默认为机器总的cpu数。

### 停止集群

Head节点与Worker节点服务的停止命令相同，执行：

```
ray stop
```

## 连接集群

使用如下方法建立连接：

```python
import ray

ray.init(redis_address="192.168.0.1:6379")
```
