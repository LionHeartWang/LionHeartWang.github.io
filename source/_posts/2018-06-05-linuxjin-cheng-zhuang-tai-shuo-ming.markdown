---
layout: post
title: "Linux进程状态说明"
date: 2018-06-05 12:13:12 +0800
comments: true
categories: [技术资源] 
---
Linux是一个多用户，多任务的系统，可以同时运行多个用户的多个进程，每个进程会有不同的状态。  本文对进程的R、S、D、T、Z、X 六种状态进行解释说明。

参考博客：https://blog.csdn.net/tianlesoftware/article/details/6457487

 <!-- More -->

## 进程状态定义

PROCESS STATE CODE英文说明如下：

```
       D    Uninterruptible sleep (usually IO)
       R    Running or runnable (on run queue)
       S    Interruptible sleep (waiting for an event to complete)
       T    Stopped, either by a job control signal or because it is being traced.
       W    paging (not valid since the 2.6.xx kernel)
       X    dead (should never be seen)
       Z    Defunct ("zombie") process, terminated but not
            reaped by its parent.
```

一些额外标记含义如下：

```
       <    high-priority (not nice to other users)
       N    low-priority (nice to other users)
       L    has pages locked into memory (for real-time and custom IO)
       s    is a session leader
       l    is multi-threaded (using CLONE_THREAD, like NPTL pthreads do)
       +    is in the foreground process group
``` 
 
 中文说明如下：

- O:  进程正在处理器运行,这个状态从来木见过.
- S：休眠状态（sleeping）
- R：等待运行（runable）R Running or runnable (on run queue) 进程处于运行或就绪状态
- I：空闲状态（idle） 
- Z：僵尸状态（zombie）　　　
- T：跟踪状态（Traced）
- B：进程正在等待更多的内存页
- D:  不可中断的深度睡眠，一般由IO引起，同步IO在做读或写操作时，cpu不能做其它事情，只能等待，这时进程处于这种状态，如果程序采用异步IO，这种状态应该就很少见到了
 
 
## 进程状态说明
 
上面罗列的状态分别进行说明。

### R (task_running) : 可执行状态

只有在该状态的进程才可能在CPU上运行，而同一时刻可能有多个进程处于可执行状态，这些进程的task_struct结构（进程控制块）被放入对应CPU的可执行队列中（一个进程最多只能出现在一个CPU的可执行队列中）。

进程调度器的任务就是从各个CPU的可执行队列中分别选择一个进程在该CPU上运行。

很多操作系统教科书将正在CPU上执行的进程定义为RUNNING状态、而将可执行但是尚未被调度执行的进程定义为READY状态，这两种状态在linux下统一为 TASK_RUNNING状态。


### S (task_interruptible): 可中断的睡眠状态

处于这个状态的进程因为等待某某事件的发生（比如等待socket连接、等待信号量），而被挂起。

这些进程的task_struct结构被放入对应事件的等待队列中。当这些事件发生时（由外部中断触发、或由其他进程触发），对应的等待队列中的一个或多个进程将被唤醒。

通过ps命令我们会看到，一般情况下，进程列表中的绝大多数进程都处于task_interruptible状态（除非机器的负载很高）。

毕竟CPU就这么一两个，进程动辄几十上百个，如果不是绝大多数进程都在睡眠，CPU又怎么响应得过来。

### D (task_uninterruptible): 不可中断的睡眠状态

与task_interruptible状态类似，进程处于睡眠状态，但是此刻进程是不可中断的。

不可中断，指的并不是CPU不响应外部硬件的中断，而是指进程不响应异步信号。

绝大多数情况下，进程处在睡眠状态时，总是应该能够响应异步信号的。

但是uninterruptible sleep 状态的进程不接受外来的任何信号，因此无法用kill杀掉这些处于D状态的进程，无论是”kill”, “kill -9″还是”kill -15″。

这种情况下，一个可选的方法是reboot。

处于uninterruptible sleep状态的进程通常是在等待IO，比如磁盘IO，网络IO，其他外设IO等。

如果进程正在等待的IO在较长的时间内都没有响应，那么就被ps看到了，同时也就意味着很有可能有IO出了问题，可能是外设本身出了故障，也可能是比如挂载的远程文件系统已经不可访问了。

 
而task_uninterruptible状态存在的意义就在于，内核的某些处理流程是不能被打断的。

如果响应异步信号，程序的执行流程中就会被插入一段用于处理异步信号的流程（这个插入的流程可能只存在于内核态，也可能延伸到用户态），于是原有的流程就被中断了。

在进程对某些硬件进行操作时（比如进程调用read系统调用对某个设备文件进行读操作，而read系统调用最终执行到对应设备驱动的代码，并与对应的物理设备进行交互）。

可能需要使用task_uninterruptible状态对进程进行保护，以避免进程与设备交互的过程被打断，造成设备陷入不可控的状态。

这种情况下的task_uninterruptible状态总是非常短暂的，通过ps命令基本上不可能捕捉到。
 

###  T(task_stopped or task_traced)：暂停状态或跟踪状态

向进程发送一个sigstop信号，它就会因响应该信号而进入task_stopped状态（除非该进程本身处于task_uninterruptible状态而不响应信号）。（sigstop与sigkill信号一样，是非常强制的。不允许用户进程通过signal系列的系统调用重新设置对应的信号处理函数。）

向进程发送一个sigcont信号，可以让其从task_stopped状态恢复到task_running状态。

当进程正在被跟踪时，它处于task_traced这个特殊的状态。

“正在被跟踪”指的是进程暂停下来，等待跟踪它的进程对它进行操作。比如在gdb中对被跟踪的进程下一个断点，进程在断点处停下来的时候就处于task_traced状态。

而在其他时候，被跟踪的进程还是处于前面提到的那些状态。

对于进程本身来说，task_stopped和task_traced状态很类似，都是表示进程暂停下来。

而task_traced状态相当于在task_stopped之上多了一层保护，处于task_traced状态的进程不能响应sigcont信号而被唤醒。

只能等到调试进程通过ptrace系统调用执行ptrace_cont、ptrace_detach等操作（通过ptrace系统调用的参数指定操作），或调试进程退出，被调试的进程才能恢复task_running状态。


### Z (task_dead - exit_zombie)：退出状态，进程成为僵尸进程

在Linux进程的状态中，僵尸进程是非常特殊的一种，它是已经结束了的进程，但是没有从进程表中删除。太多了会导致进程表里面条目满了，进而导致系统崩溃，倒是不占用其他系统资源。    

它已经放弃了几乎所有内存空间，没有任何可执行代码，也不能被调度，仅仅在进程列表中保留一个位置，记载该进程的退出状态等信息供其他进程收集，除此之外，僵尸进程不再占有任何内存空间。

进程在退出的过程中，处于TASK_DEAD状态。在这个退出过程中，进程占有的所有资源将被回收，除了task_struct结构（以及少数资源）以外。于是进程就只剩下task_struct这么个空壳，故称为僵尸。

之所以保留task_struct，是因为task_struct里面保存了进程的退出码、以及一些统计信息。而其父进程很可能会关心这些信息。

比如在shell中，#?变量就保存了最后一个退出的前台进程的退出码，而这个退出码往往被作为if语句的判断条件。

当然，内核也可以将这些信息保存在别的地方，而将task_struct结构释放掉，以节省一些空间。但是使用task_struct结构更为方便，因为在内核中已经建立了从pid到task_struct查找关系，还有进程间的父子关系。释放掉task_struct，则需要建立一些新的数据结构，以便让父进程找到它的子进程的退出信息。

子进程在退出的过程中，内核会给其父进程发送一个信号，通知父进程来“收尸”。 父进程可以通过wait系列的系统调用（如wait4、waitid）来等待某个或某些子进程的退出，并获取它的退出信息。然后wait系列的系统调用会顺便将子进程的尸体（task_struct）也释放掉。

这个信号默认是SIGCHLD，但是在通过clone系统调用创建子进程时，可以设置这个信号。

如果他的父进程没安装SIGCHLD信号处理函数调用wait或waitpid()等待子进程结束，又没有显式忽略该信号，那么它就一直保持僵尸状态，子进程的尸体（task_struct）也就无法释放掉。

如果这时父进程结束了，那么init进程自动会接手这个子进程，为它收尸，它还是能被清除的。但是如果如果父进程是一个循环，不会结束，那么子进程就会一直保持僵尸状态，这就是为什么系统中有时会有很多的僵尸进程。

当进程退出的时候，会将它的所有子进程都托管给别的进程（使之成为别的进程的子进程）。托管的进程可能是退出进程所在进程组的下一个进程（如果存在的话），或者是1号进程。

所以每个进程、每时每刻都有父进程存在。除非它是1号进程。1号进程，pid为1的进程，又称init进程。

linux系统启动后，第一个被创建的用户态进程就是init进程。它有两项使命：

- 1、执行系统初始化脚本，创建一系列的进程（它们都是init进程的子孙）；
- 2、在一个死循环中等待其子进程的退出事件，并调用waitid系统调用来完成“收尸”工作；

init进程不会被暂停、也不会被杀死（这是由内核来保证的）。

它在等待子进程退出的过程中处于task_interruptible状态，“收尸”过程中则处于task_running状态。

Unix/Linux 处理僵尸进程的方法：

- 找出父进程号，然后kill 父进程，之后子进程（僵尸进程）会被托管到其他进程，如init进程，然后由init进程将子进程的尸体（task_struct）释放掉。

僵尸进程解决办法：

- 改写父进程，在子进程死后要为它收尸。
    - 具体做法是接管SIGCHLD信号。子进程死后，会发送SIGCHLD信号给父进程，父进程收到此信号后，执行 waitpid()函数为子进程收尸。
    - 这是基于这样的原理：就算父进程没有调用wait，内核也会向它发送SIGCHLD消息，尽管对的默认处理是忽略，如果想响应这个消息，可以设置一个处理函数。

- 把父进程杀掉。
    - 父进程死后，僵尸进程成为"孤儿进程"，过继给1号进程init，init始终会负责清理僵尸进程．它产生的所有僵尸进程也跟着消失。如：kill -9 `ps -ef | grep "Process Name" | awk '{ print $3 }'`
    - 其中，“Process Name”为处于zombie状态的进程名。
- 杀父进程不行的话，就尝试用skill -t TTY关闭相应终端，TTY是进程相应的tty号(终端号)。但是，ps可能会查不到特定进程的tty号，这时就需要自己判断了。
- 重启系统，这也是最常用到方法之一。

### X (task_dead - exit_dead)：退出状态，进程即将被销毁

进程在退出过程中也可能不会保留它的task_struct。比如这个进程是多线程程序中被detach过的进程。

或者父进程通过设置sigchld信号的handler为sig_ign，显式的忽略了sigchld信号。（这是posix的规定，尽管子进程的退出信号可以被设置为sigchld以外的其他信号。）

此时，进程将被置于exit_dead退出状态，这意味着接下来的代码立即就会将该进程彻底释放。所以exit_dead状态是非常短暂的，几乎不可能通过ps命令捕捉到。

## 进程状态变化说明

### 进程的初始状态

进程是通过fork系列的系统调用（fork、clone、vfork）来创建的，内核（或内核模块）也可以通过kernel_thread函数创建内核进程。

这些创建子进程的函数本质上都完成了相同的功能——将调用进程复制一份，得到子进程。（可以通过选项参数来决定各种资源是共享、还是私有。）

那么既然调用进程处于task_running状态（否则，它若不是正在运行，又怎么进行调用？），则子进程默认也处于task_running状态。

另外，在系统调用调用clone和内核函数kernel_thread也接受clone_stopped选项，从而将子进程的初始状态置为 task_stopped。

### 进程状态变迁

进程自创建以后，状态可能发生一系列的变化，直到进程退出。

而尽管进程状态有好几种，但是进程状态的变迁却只有两个方向:

- 从task_running状态变为非task_running状态
- 或者从非task_running状态变为task_running状态。

也就是说，如果给一个task_interruptible状态的进程发送sigkill信号，这个进程将先被唤醒（进入task_running状态），然后再响应sigkill信号而退出（变为task_dead状态）。并不会从task_interruptible状态直接退出。

进程从非task_running状态变为task_running状态，是由别的进程（也可能是中断处理程序）执行唤醒操作来实现的。执行唤醒的进程设置被唤醒进程的状态为task_running，然后将其task_struct结构加入到某个cpu的可执行队列中。于是被唤醒的进程将有机会被调度执行。

而进程从task_running状态变为非task_running状态，则有两种途径：

- 1、响应信号而进入task_stoped状态、或task_dead状态；
- 2、执行系统调用主动进入task_interruptible状态（如nanosleep系统调用）、或task_dead状态（如exit系统调用）；或由于执行系统调用需要的资源得不到满足，而进入task_interruptible状态或task_uninterruptible状态（如select系统调用）。

显然，这两种情况都只能发生在进程正在cpu上执行的情况下。
