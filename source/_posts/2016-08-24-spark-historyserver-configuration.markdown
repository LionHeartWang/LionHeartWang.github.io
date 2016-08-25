---
layout: post
title: "Spark HistoryServer 配置和使用方法"
date: 2016-08-24 17:17:58 +0800
comments: true
categories: [Spark, 大数据]
---
本文介绍Spark History Server的配置和使用方法。

<!--More-->

## History Server 配置

Spark提供了History Server服务可以保存历史Application的运行记录。

### 客户端配置

对于提交应用程序的客户端需要在conf/spark-defaults.conf中配置以下参数：

| 参数        | 功能           |
| ------------- |:-------------|
| spark.eventLog.enabled      | 是否记录Spark事件，用于应用程序在完成后重构webUI。 |
| spark.eventLog.dir      | spark.eventLog.enabled为 true，该属性为记录spark事件的根目录。在此根目录中，Spark为每个应用程序创建分目录，并将应用程序的事件记录到此目录中。<br>可以将此属性设置为HDFS目录，以便history server读取历史记录文件。</br>      |
| spark.yarn.historyServer.address | Spark history server的地址。 这个地址会在Spark应用程序完成后提交给YARN RM，然后RM将信息从RM UI写到history server UI上。<br>**<font color=red>注意：hostname:port，前面不加http：//，末尾也不要加反斜杠。</font>** </br>     |


### 服务端配置

服务端主要需要在conf/spark-defaults.conf中配置如下属性：

| 参数        | 功能           | 默认值
| ------------- |:-------------|:-------------|
| spark.history.ui.port     | History Server的默认访问端口。**<font color=red>建议配置在8000~9000之间，以确保再内网浏览器能够正常显示。**<font color=red> | 18080 |
| spark.history.fs.logDirectory    |   用于指定HistoryServer读取的eventlog存放的hdfs路径。  |无|
| spark.history.updateInterval |  History Server显示信息的刷新时间间隔，以秒为单位。每次更新都会检查持久层事件日志的任何变化。  | 10 |
|spark.history.retainedApplications|在History Server上显示的最大应用程序数量，如果超过这个值，旧的应用程序信息将被删除。|250|

如果使用Kerberos认证可以配置如下参数：

| 参数        | 功能           | 默认值
| ------------- |:-------------|:-------------|
| spark.history.kerberos.enabled	| 是否使用kerberos方式登录访问history server。|false|
|spark.history.kerberos.principal|spark.history.kerberos.enabled为true时使用，用于指定History Server的kerberos主体名称|空|
|spark.history.kerberos.keytab|spark.history.kerberos.enabled为true时使用，用于指定History Server的kerberos keytab文件位置|空|
|spark.history.ui.acls.enable|授权用户查看应用程序信息的时候是否检查acl。如果启用，无论应用程序的spark.ui.acls.enable怎么设置，都要进行授权检查。<br>只有应用程序所有者和spark.ui.view.acls指定的用户可以查看应用程序信息; 如果禁用，不做任何检查。</br>|false|


另外，服务端可以配置以下环境变量：

| 参数        | 功能           | 
| ------------- |:-------------|
|SPARK_DAEMON_JAVA_OPTS|History Server的JVM参数，默认为空|
|SPARK_DAEMON_MEMORY|分配给History Server的内存大小，默认512M|
|SPARK_HISTORY_OPTS|History Server的属性设置，默认为空。|
|SPARK_PUBLIC_DNS|History Server的公网地址，如果不设置，可以用内网地址来访问，默认为空。|


## History Server 使用

### 启动

一般将客户端运行生成的eventlog统一存放在一个HDFS路径下便于查询历史记录，然后History Server端 spark.history.fs.logDirectory的值设为该路径即可。

启动History Server命令：

```
$sh sbin/start-history-server.sh
```

### 停止

停止History Server命令：

```
$sh sbin/stop-history-server.sh
```

