---
layout: post
title: "ZooKeeper安装使用指南"
date: 2017-01-20 15:56:22 +0800
comments: true
categories: [大数据] 
---
ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务。

作为分布式应用提供一致性服务的软件，ZooKeeper 封装了易错的关键服务，提供简单高效、功能稳定接口给用户

本文介绍 ZooKeeper 的配置方法和客户端使用方法。
<!--more-->

## ZooKeeper 安装 

以ZooKeeper 3.4.8为例，下载 [ZooKeeper 3.4.8](http://mirrors.hust.edu.cn/apache/zookeeper/zookeeper-3.4.8/)
下载解压后配置conf/zoo.cfg，配置clientPort，dataDir等。
示例配置：

```bash
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial synchronization phase can take
initLimit=10
# The number of ticks that can pass between sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored. do not use /tmp for storage, /tmp here is just example sakes.
dataDir=/tmp/zookeeper
# the port at which the clients will connect
clientPort=2181
```

## ZooKeeper 使用 

配置好Zk后需要先启动ZkServer，然后可以用Zk Client直接以命令行的方式操作Zk。

### Server端

配置好后启动zk：

```bash
$sh bin/zkServer.sh start > zookeeper.out
```

### Client端

ZooKeeper客户端的使用非常简单，启动：

```bash
# ip和端口根据启动情况修改
$sh bin/zkCli.sh -server 127.0.0.1:2181
```

之后可以用ls、delete、get等命令查询或修改各ZK节点的值。命令帮助如下：

```
ZooKeeper -server host:port cmd args
	connect host:port
	get path [watch]
	ls path [watch]
	set path data [version]
	rmr path
	delquota [-n|-b] path
	quit
	printwatches on|off
	create [-s] [-e] path data acl
	stat path [watch]
	close
	ls2 path [watch]
	history
	listquota path
	setAcl path acl
	getAcl path
	sync path
	redo cmdno
	addauth scheme auth
	delete path [version]
	setquota -n|-b val path
```

## ZooKeeper API

除了通过客户端操作ZooKeeper，还可以调用ZooKeeper提供的API操作ZooKeeper的节点。

这里以ZooKeeper 3.4.5为例，介绍常用的几个Java API。

### 建立连接

在应用程序中使用Zk需要先创建ZooKeeper对象，后续的操作都是基于该对象进行的。

```java
public ZooKeeper(String connectString, int sessionTimeout, Watcher watcher) throws IOException  
```

参数说明：

- connectString： zookeeper server列表, 以逗号隔开。ZooKeeper对象初始化后, 将从列表中选择一个server, 并尝试建立连接。如果失败,则会从剩余项中选择并再次尝试建立连接。
- sessionTimeout：指定连接的超时时间.
- watcher： 事件回调接口。

### 创建/删除znode

ZooKeeper对象的create/delete方法用于创建/删除 znode。如果该node存在, 则返回该node的状态信息, 否则返回null。

```java
public String create(String path, byte[] data, List acl, CreateMode createMode); 
public void delete(final String path, int version);  
```

参数说明：

- path： znode的路径。
- data：与znode关联的数据。
- acl：指定权限信息
- createMode：指定znode类型，按持久化节点与临时节点，以及自动编号节点与非自动编号节点两个维度划分，共4类。
- version：指定要更新的数据的版本, 如果version和真实的版本不同, 更新操作将失败.。指定version为-1则忽略版本检查。

### 获取子znode列表

ZooKeeper对象的getChildren方法用于获取子node列表。

```java
public List getChildren(String path, boolean watch); 
```

参数说明：

- path： znode的路径。
- watch参数用于指定是否监听path node的创建, 删除事件, 以及数据更新事件。

### 判断znode是否存在

ZooKeeper对象的exists方法用于判断指定znode是否存在。如果该node存在, 则返回该node的状态信息, 否则返回null。

```java
public Stat exists(String path, boolean watch);  
```

参数说明：

- path： znode的路径。
- watch：用于指定是否监听path node的创建, 删除事件, 以及数据更新事件。

### 获取/更新znode数据

ZooKeeper对象的getData/setData方法用于获取/更新 znode关联的数据。

```java
public byte[] getData(String path, boolean watch, Stat stat);  
public Stat setData(final String path, byte data[], int version); 
```

参数说明：

- path： znode的路径。
- stat：传出参数, getData方法会将path node的状态信息设置到该参数中。
- data：与znode关联的数据。
- watch：用于指定是否监听path node的创建, 删除事件, 以及数据更新事件。
- version：指定要更新的数据的版本, 如果version和真实的版本不同, 更新操作将失败.。指定version为-1则忽略版本检查。


更全的API介绍参考 ZooKeeper 3.4.5 API

