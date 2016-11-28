---
layout: post
title: "Spark Core 消息队列机制"
date: 2016-11-28 14:31:03 +0800
comments: true
categories: [Spark, 大数据]
---
本文介绍Spark中的消息队列机制，首先SparkListenerEvent，SparkListener和SparkListenerBus等基本数据结构实现。

重点介绍了异步消息总线LiveListenerBus的实现。随后介绍了Spark消息队列的整体工作流程。
<!--more-->

## SparkListenerEvent

Spark中的消息由SparkListenerEvent表示。其本身定义只是一个接口：

```scala
trait SparkListenerEvent {
  /* Whether output this event to the event log */
  protected[spark] def logEvent: Boolean = true
}
```

SparkListenerEvent有多个具体的实现，每种实现代表了Spark运行过程中的一种事件。

* SparkListenerStageSubmitted
* SparkListenerStageCompleted
* SparkListenerTaskStart
* SparkListenerTaskGettingResult
* SparkListenerTaskEnd
* SparkListenerJobStart
* SparkListenerJobEnd
* SparkListenerEnvironmentUpdate
* SparkListenerBlockManagerAdded
* SparkListenerBlockManagerRemoved
* SparkListenerUnpersistRDD
* SparkListenerExecutorAdded
* SparkListenerExecutorRemoved
* SparkListenerBlockUpdated
* SparkListenerExecutorMetricsUpdate
* SparkListenerApplicationStart
* SparkListenerApplicationEnd
* SparkListenerLogStart

根据名称可以知道每一种事件代表的含义。

## SparkListener

SparkListeners负责监听SparkListenerEvents。

所有Spark消息SparkListenerEvents 被异步的发送给已经注册过的SparkListeners。

SparkListenerInterface定义了SparkListener的接口：

* onStageCompleted
* onStageSubmitted
* onTaskStart
* onTaskGettingResult
* onTaskEnd
* onJobStart
* onJobEnd
* onEnvironmentUpdate
* onBlockManagerAdded
* onBlockManagerRemoved
* onUnpersistRDD
* onApplicationStart
* onApplicationEnd
* onExecutorMetricsUpdate
* onExecutorAdded
* onExecutorRemoved
* onBlockUpdated
* onOtherEvent

根据名称可以知道每一个方法是对应事件消息的响应函数。SparkListener的实现：

```scala
abstract class SparkListener extends SparkListenerInterface {
  override def onStageCompleted(stageCompleted: SparkListenerStageCompleted): Unit = { }
  override def onStageSubmitted(stageSubmitted: SparkListenerStageSubmitted): Unit = { }
  override def onTaskStart(taskStart: SparkListenerTaskStart): Unit = { }
  override def onTaskGettingResult(taskGettingResult: SparkListenerTaskGettingResult): Unit = { }
  override def onTaskEnd(taskEnd: SparkListenerTaskEnd): Unit = { }
  override def onJobStart(jobStart: SparkListenerJobStart): Unit = { }
  override def onJobEnd(jobEnd: SparkListenerJobEnd): Unit = { }
  override def onEnvironmentUpdate(environmentUpdate: SparkListenerEnvironmentUpdate): Unit = { }
  override def onBlockManagerAdded(blockManagerAdded: SparkListenerBlockManagerAdded): Unit = { }
  override def onBlockManagerRemoved(
      blockManagerRemoved: SparkListenerBlockManagerRemoved): Unit = { }
  override def onUnpersistRDD(unpersistRDD: SparkListenerUnpersistRDD): Unit = { }
  override def onApplicationStart(applicationStart: SparkListenerApplicationStart): Unit = { }
  override def onApplicationEnd(applicationEnd: SparkListenerApplicationEnd): Unit = { }
  override def onExecutorMetricsUpdate(
      executorMetricsUpdate: SparkListenerExecutorMetricsUpdate): Unit = { }
  override def onExecutorAdded(executorAdded: SparkListenerExecutorAdded): Unit = { }
  override def onExecutorRemoved(executorRemoved: SparkListenerExecutorRemoved): Unit = { }
  override def onBlockUpdated(blockUpdated: SparkListenerBlockUpdated): Unit = { }
  override def onOtherEvent(event: SparkListenerEvent): Unit = { }
}
```

Spark运行过程中会用到很多个SparkListener，每一种都有自己的用途。

例如EventLoggingListener用来将监听到的事件持久化到文件中，ExecutorAllocationListener用那个通知对应的ExecutorAllocationManager增加或移除executor等。

## SparkListenerBus

SparkListener需要被注册到SparkListenerBus中才能起作用，SparkListenerBus负责分发监听到的Event给SparkListener。

SparkListenerBus继承自ListenerBus接口，并重载了doPostEvent方法。

```scala
private[spark] trait SparkListenerBus
  extends ListenerBus[SparkListenerInterface, SparkListenerEvent] {

  protected override def doPostEvent(
      listener: SparkListenerInterface,
      event: SparkListenerEvent): Unit = {
    event match {
      case stageSubmitted: SparkListenerStageSubmitted =>
        listener.onStageSubmitted(stageSubmitted)
      case stageCompleted: SparkListenerStageCompleted =>
        listener.onStageCompleted(stageCompleted)
      case jobStart: SparkListenerJobStart =>
        listener.onJobStart(jobStart)
      case jobEnd: SparkListenerJobEnd =>
        listener.onJobEnd(jobEnd)
      ...
      case blockUpdated: SparkListenerBlockUpdated =>
        listener.onBlockUpdated(blockUpdated)
      case logStart: SparkListenerLogStart => // ignore event log metadata
      case _ => listener.onOtherEvent(event)
    }
  }

}
```

该接口实现了消息的路由，根据事件类型调用相应的处理函数。

### ListenerBus

ListenerBus接口的实现如下：

```
private[spark] trait ListenerBus[L <: AnyRef, E] extends Logging {

  // Marked `private[spark]` for access in tests.
  private[spark] val listeners = new CopyOnWriteArrayList[L]

  final def addListener(listener: L): Unit = {
    listeners.add(listener)
  }

  final def removeListener(listener: L): Unit = {
    listeners.remove(listener)
  }

  /**
   * Post the event to all registered listeners. The `postToAll` caller should guarantee calling
   * `postToAll` in the same thread for all events.
   */
  final def postToAll(event: E): Unit = {
    // JavaConverters can create a JIterableWrapper if we use asScala.
    // However, this method will be called frequently. To avoid the wrapper cost, here we use
    // Java Iterator directly.
    val iter = listeners.iterator
    while (iter.hasNext) {
      val listener = iter.next()
      try {
        doPostEvent(listener, event)
      } catch {
        case NonFatal(e) =>
          logError(s"Listener ${Utils.getFormattedClassName(listener)} threw an exception", e)
      }
    }
  }

  /**
   * Post an event to the specified listener. `onPostEvent` is guaranteed to be called in the same
   * thread for all listeners.
   */
  protected def doPostEvent(listener: L, event: E): Unit

  private[spark] def findListenersByClass[T <: L : ClassTag](): Seq[T] = {
    val c = implicitly[ClassTag[T]].runtimeClass
    listeners.asScala.filter(_.getClass == c).map(_.asInstanceOf[T]).toSeq
  }

}
```

本质上所有注册的Listener用一个数组记录下来，post操作就是根据事件找到对应的listener然后把event交给listener处理。

### LiveListenerBus

SparkContext中会创建一个LiveListenerBus实例，LiveListenerBus是SparkListenerBus的一个具体实现，主要功能如下:

* 保存有消息队列,负责消息的缓存
* 保存有注册过的listener,负责消息的分发

消息队列用LinkBlockQueue实现：

```scala
// Cap the capacity of the event queue so we get an explicit error (rather than
// an OOM exception) if it's perpetually being added to more quickly than it's being drained.
private lazy val EVENT_QUEUE_CAPACITY = validateAndGetQueueSize()
private lazy val eventQueue = new LinkedBlockingQueue[SparkListenerEvent](EVENT_QUEUE_CAPACITY)
```

事件队列的长度EVENT_QUEUE_CAPACITY由spark.scheduler.listenerbus.eventqueue.size参数配置，默认为10000。 

当缓存事件数量达到上限后,新来的事件会被丢弃。

消息的产生和分发按照 <b><font color=red>生产者-消费者模型</font></b> 实现。

<b><font color=red>消息的分发(消费者)</font></b> 是通过一个listener线程异步处理的，代码如下。

```scala
private val listenerThread = new Thread(name) {  // <-- 线程名为SparkListenerBus
  setDaemon(true)
  override def run(): Unit = Utils.tryOrStopSparkContext(sparkContext) {
    LiveListenerBus.withinListenerThread.withValue(true) {
      while (true) {
        eventLock.acquire()
        self.synchronized {
          processingEvent = true
        }
        try {
          val event = eventQueue.poll
          if (event == null) {
            // Get out of the while loop and shutdown the daemon thread
            if (!stopped.get) {
              throw new IllegalStateException("Polling `null` from eventQueue means" +
                " the listener bus has been stopped. So `stopped` must be true")
            }
            return
          }
          postToAll(event)
        } finally {
          self.synchronized {
            processingEvent = false
          }
        }
      }
    }
  }
}
```

为了保证生产者和消费者对消息队列的并发访问，在每次需要获取消息的时候,调用eventLock.acquire()来获取信号量, 信号量的值就是当前队列中所含有的事件数量。

如果正常获取到事件,就调用postToAll将事件分发给所有listener, 继续下一次循环。

如果获取到null值, 则有下面两种情况:

* 整个application正常结束, 此时stopped值已经被设置为true。
* 系统发生了错误, 立即终止运行。

<font color=red><b>消息的产生(生产者)</font></b> 通过在Spark运行时调用LiveListenerBus的post方法来添加。实现如下：

```scala
def post(event: SparkListenerEvent): Unit = {
  if (stopped.get) {
    // Drop further events to make `listenerThread` exit ASAP
    logError(s"$name has already stopped! Dropping event $event")
    return
  }
  val eventAdded = eventQueue.offer(event)  // <-- 这里将新来的事件添加到消息队列中
  if (eventAdded) {
    eventLock.release()
  } else {
    onDropEvent(event)  // <-- 没有添加成功，则丢弃事件
    droppedEventsCounter.incrementAndGet()
  }

  val droppedEvents = droppedEventsCounter.get
  if (droppedEvents > 0) {
    // Don't log too frequently
    if (System.currentTimeMillis() - lastReportTimestamp >= 60 * 1000) {
      // There may be multiple threads trying to decrease droppedEventsCounter.
      // Use "compareAndSet" to make sure only one thread can win.
      // And if another thread is increasing droppedEventsCounter, "compareAndSet" will fail and
      // then that thread will update it.
      if (droppedEventsCounter.compareAndSet(droppedEvents, 0)) {
        val prevLastReportTimestamp = lastReportTimestamp
        lastReportTimestamp = System.currentTimeMillis()
        logWarning(s"Dropped $droppedEvents SparkListenerEvents since " +
          new java.util.Date(prevLastReportTimestamp))
      }
    }
  }
}
```

每成功放入一个事件,就调用eventLock.release()来增加信号量额值，以供消费者线程来进行消费. 如果队列满了,就调用onDropEvent来处理。

## 消息队列建立/发送流程

在SparkContext中创建了LiveListenerBus类类型的成员变量listenerBus。

```scala
// An asynchronous listener bus for Spark events
private[spark] val listenerBus = new LiveListenerBus(this)
随后创建各种listener，并注册到listenerBus中，通过调用listenerBus的start()方法启动消息分发流程。
private def setupAndStartListenerBus(): Unit = {
  // Use reflection to instantiate listeners specified via `spark.extraListeners`
  try {
    val listenerClassNames: Seq[String] =
      conf.get("spark.extraListeners", "").split(',').map(_.trim).filter(_ != "")  
    for (className <- listenerClassNames) {  // <-- 如果指定了额外的SparkListenr类，可通过反射机制实例化并注册到listenerBus
      // Use reflection to find the right constructor
      val constructors = {
        val listenerClass = Utils.classForName(className)
        listenerClass
            .getConstructors
            .asInstanceOf[Array[Constructor[_ <: SparkListenerInterface]]]
      }
      val constructorTakingSparkConf = constructors.find { c =>
        c.getParameterTypes.sameElements(Array(classOf[SparkConf]))
      }
      lazy val zeroArgumentConstructor = constructors.find { c =>
        c.getParameterTypes.isEmpty
      }
      val listener: SparkListenerInterface = {
        if (constructorTakingSparkConf.isDefined) {
          constructorTakingSparkConf.get.newInstance(conf)
        } else if (zeroArgumentConstructor.isDefined) {
          zeroArgumentConstructor.get.newInstance()
        } else {
          ...
        }
      }
      listenerBus.addListener(listener)
      logInfo(s"Registered listener $className")
    }
  } catch {
    ...
  }

  listenerBus.start()
  _listenerBusStarted = true
}
```

其中，listenerBus.start() 实现如下：

```scala
def start(): Unit = {
  if (started.compareAndSet(false, true)) {
    listenerThread.start()
  } else {
    throw new IllegalStateException(s"$name already started!")
  }
}
```

运行过程中产生的事件会post到listenerBus中。

当作业运行结束后会调用listenerBus.stop()来停止SparkListenerBus线程。

```scala
def stop(): Unit = {
  if (!started.get()) {
    throw new IllegalStateException(s"Attempted to stop $name that has not yet started!")
  }
  if (stopped.compareAndSet(false, true)) {
    // Call eventLock.release() so that listenerThread will poll `null` from `eventQueue` and know
    // `stop` is called.
    eventLock.release()
    listenerThread.join()
  } else {
    // Keep quiet
  }
}
```

这里可以看到：

<b><font color=red>在stop函数中调用了eventLock.release()来增加信号量的值. 然而并未向消息队列中加入新的消息。

这就导致在消费者线程listenerThread读取队列时会返回null值,进而达到结束listenerThread线程的目的。</font></b>

以上就是Spark Core中消息队列机制的整体工作流程。

   
<b>参考资料</b>

1. Spark 2.0 源码：https://github.com/apache/spark/tree/branch-2.0
2. Spark消息队列机制源码学习Blog：http://blog.csdn.net/sivolin/article/details/47316099
