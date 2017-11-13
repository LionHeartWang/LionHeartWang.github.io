---
layout: post
title: "使用Fuse挂载HDFS到本地目录方法"
date: 2017-11-14 00:10:27 +0800
comments: true
categories: [技术资源, 大数据] 
---

网上关于挂载HDFS到本地的介绍大多基于较早版本的Hadoop。
本文以Hadoop-2.8.0为例，介绍通过Fuse挂载HDFS到本地的方法。

<!--more-->

## 安装Fuse

对每台节点，执行如下命令一键安装

```bash
sudo yum -y install fuse fuse-libs
```

## 编译fuse-dfs工具

下载hadoop-2.8.0源码，解压编译

```bash
tar zxvf hadoop-2.8.0.tar.gz
cd hadoop-2.8.0
mvn package -Drequire.fuse=true -DskipTests -Dmaven.javadoc.skip=true -Dtar
```

编译后会生成fuse_dfs的可执行文件，位于

> ./hadoop-hdfs-project/hadoop-hdfs-native-client/target/main/native/fuse-dfs/fuse_dfs

另外会生成一个对该可执行程序的封装脚本，位于

> ./hadoop-hdfs-project/hadoop-hdfs-native-client/src/main/native/fuse-dfs/fuse_dfs_wrapper.sh

## 配置环境变量

可以为fuse_dfs_wrapper.sh建立软链接到当前目录方便后续使用。

```bash
ln -s /<Hadoop源码路径>/hadoop-hdfs-project/hadoop-hdfs-native-client/src/main/native/fuse-dfs/fuse_dfs_wrapper.sh .
```
编辑fuse_dfs_wrapper.sh内容，有一些需要根据具体情况修改：

```bash
HADOOP_HOME=/path/to/your/hadoop
HADOOP_PREFIX=/path/to/your/hadoop/src/

export FUSEDFS_PATH="$HADOOP_PREFIX/hadoop-hdfs-project/hadoop-hdfs-native-client/target/main/native/fuse-dfs"
export LIBHDFS_PATH="$HADOOP_PREFIX/hadoop-hdfs-project/hadoop-hdfs-native-client/target/native/target/usr/local/lib"
HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop

if [ "$OS_ARCH" = "" ]; then
  export OS_ARCH=amd64
fi

# 这里需要替换为JDK的安装路径
JAVA_HOME=/home/yiguang.wyg/tools/jdk1.8.0_121

if [ "$LD_LIBRARY_PATH" = "" ]; then
  export LD_LIBRARY_PATH=$JAVA_HOME/jre/lib/$OS_ARCH/server:/usr/local/lib
fi

JARS=`find "$HADOOP_PREFIX/hadoop-hdfs-project" -name "*.jar" | xargs`
for jar in $JARS; do
  CLASSPATH=$jar:$CLASSPATH
done

JARS=`find "$HADOOP_PREFIX/hadoop-client" -name "*.jar" | xargs`
for jar in $JARS; do
  CLASSPATH=$jar:$CLASSPATH
done

export CLASSPATH=$HADOOP_CONF_DIR:$CLASSPATH
export PATH=$FUSEDFS_PATH:$PATH
export LD_LIBRARY_PATH=$LIBHDFS_PATH:$JAVA_HOME/jre/lib/$OS_ARCH/server:$LD_LIBRARY_PATH

fuse_dfs "$@"
```

重点需要配置好HADOOP_HOME和HADOOP_PREFIX，分别为hadoop安装路径和hadoop源码路径。

## 挂载HDFS

挂载HDFS之前需要确保HDFS已经启动。

创建挂载目录

```bash
sudo mkdir /mnt/hdfs
```

执行：

```bash
sudo sh fuse_dfs_wrapper.sh hdfs://<hdfs路径> /mnt/hdfs
```

输出：

> INFO /.../hadoop-2.8.0-src/hadoop-hdfs-project/hadoop-hdfs-native-client/src/main/native/fuse-dfs/fuse_options.c:164 Adding FUSE arg /mnt/hdfs

进入挂载目录，如果能访问到HDFS中的内容，说明挂载成功。
```
cd /mnt/hdfs
ls
```

挂载成功后，就可以将HDFS当做本地路径使用了。
