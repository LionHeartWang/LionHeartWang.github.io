---
layout: post
title: "Spark日志配置方法"
date: 2016-10-19 19:13:38 +0800
comments: true
categories: [Spark, 大数据] 
---
本文介绍Spark日志级别控制方法。

Apache Spark 默认使用 log4j 作为日志工具。
Baidu Spark 根据不同的发布版本，使用 log4j 或者 logback 作为日志工具。

<!--more-->

## Driver日志级别设置

日志配置默认在Spark客户端conf目录下，log4j配置log4j.properties文件，logback配置logback.xml文件。

### log4j配置示例
示例配置文件log4j.properties如下：

```bash
# Set everything to be logged to the console
log4j.rootCategory=INFO, DRFA
log4j.appender.console=org.apache.log4j.ConsoleAppender
log4j.appender.console.target=System.err
log4j.appender.console.layout=org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=%d{yy/MM/dd HH:mm:ss} %p %c{1}: %m%n
log4j.appender.DRFA=org.apache.log4j.DailyRollingFileAppender
log4j.appender.DRFA.File=log/spark.log
log4j.appender.DRFA.layout=org.apache.log4j.PatternLayout
log4j.appender.DRFA.layout.ConversionPattern=%d{yy/MM/dd HH:mm:ss} [%t] %p %c{1}: %m%n
# Settings to quiet third party logs that are too verbose
log4j.logger.org.eclipse.jetty=WARN
log4j.logger.org.eclipse.jetty.util.component.AbstractLifeCycle=ERROR
log4j.logger.org.apache.spark.repl.SparkIMain$exprTyper=INFO
log4j.logger.org.apache.spark.repl.SparkILoop$SparkILoopInterpreter=INFO
log4j.logger.org.apache.hadoop.fs.DfsInputStream=INFO
log4j.logger.org.apache.hadoop.hive.ql.io.orc.RecordReaderImpl=INFO
log4j.logger.org.apache.hadoop.hive.ql.io.*=DEBUG
```

其中：

- log4j.rootCategory配置总体的默认日志级别。
- log4j.appender.DRFA.File用来配置日志重定向的目标文件。
- log4j.appender.DRFA.layout.ConversionPattern用来配置日志的输出格式。
- log4j.logger.xxx.xxx.xxx用来配置指定类的日志级别，xxx.xxx.xxx代表类路径。

### logback配置示例

示例配置文件logback.xml如下：

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <appender name="RFILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>log/spark.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>log/spark.%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern> %date %level [%logger] - %msg%n</pattern>
    </encoder>
  </appender>
  <logger name="org.apache.hadoop.hive.ql.io.*"  level="INFO" />
  <root level="info">
    <appender-ref ref="RFILE" />
  </root>
</configuration>
```

其中：

- <root>用来配置总体的默认日志级别。
- <file>用来配置日志重定向的目标文件。
- <pattern>用来配置日志的输出格式。
- <logger>用来配置指定类的日志级别。

## Executor日志级别设置

executor日志级别配置同driver端类似，但需要将executor的日志配置文件上传，并通过executor的Java参数指定使用的配置文件名。

### log4j配置示例

配置好executor的log4j配置文件，命名随意，假设为executor-log4j.properties，放在conf目录下。

配置spark-conf.defaults文件，在 spark.executor.extraJavaOptions 中增加:

```bash
spark.executor.extraJavaOptions -Dlog4j.configuration=executor-log4j.properties
```

启动Spark作业时增加–files参数。

```bash
$spark-submit --files /path/to/conf/executor-log4j.properties xxx
则作业运行时的日志级别将由executor-log4j.properties文件控制。
```

### logback配置示例

配置好executor的logback配置文件，命名随意，假设为executor-logback.xml，放在conf目录下。

配置spark-conf.defaults文件，在 spark.executor.extraJavaOptions 中增加:

```bash
spark.executor.extraJavaOptions -Dlogback.configurationFile=executor-logback.xml
```

启动Spark作业时增加–files参数。

```bash
$spark-submit --files /path/to/conf/executor-logback.xml xxx
```

则作业运行时的日志级别将由executor-logback.xml文件控制。
