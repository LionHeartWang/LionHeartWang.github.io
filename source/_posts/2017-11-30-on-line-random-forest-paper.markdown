---
layout: post
title: "论文阅读: On-line Random Forest"
date: 2017-11-30 21:25:38 +0800
comments: true
categories: [论文笔记,机器学习]
---

2009年的一篇论文, 提出了一种在线随机森林算法（ORF）。

原文链接：http://ieeexplore.ieee.org/abstract/document/5457447/?reload=true

<!-- More -->

## 本文解决的问题

经典的随机森林算法是离线训练，每次要基于全局数据生成一系列决策树，但在线环境下难以获得全局数据，因而无法直接使用。

本文提出的算法设计参考了online-bagging的思路，效果接近离线版本的算法。

## 核心内容

本文提出的在线online random forest算法中，每棵树可以在线分裂。样本采样时每棵树采样次数基于泊松分布，每个叶子分裂的条件是预测的数量要达到一定的值和每个叶子节点信息。

每个树的生长主要通过在线接收的实时样本数据，每棵树的叶子节点分裂主要根据该节点的熵或Gini系数。

算法流程如下图所示：

![](image/07-online_random_forest.png)

说明如下：

- 步骤3. 用个possion分布确定从采样的次数，其原理见online boosting： http://www.cnblogs.com/liqizhou/archive/2012/05/10/2494145.html
- 步骤6. u代表分类的类别。
- 步骤7. j代表第t棵树上叶子节点。
- 步骤8. 统计第j个叶子节点的数目和计算Gini。
- 步骤9. 判断条件是否分裂的二个条件。
- 步骤10. 在符合条件的叶子节点中，选择一个Gini最大的叶子节点作为分类节点。

有时在线训练过程中希望丢弃较旧的信息，需要适当丢弃随机森林中的某些树。针对这种需求，原文给出了随机森林中树的选择性丢弃方案。

算法流程如下图所示：

![](image/08-orf_temporal_knowledge_weighting.png)

附C++源码实现：

- https://github.com/amirsaffari/online-random-forests

## 本文解决方案效果

随着样本数量增加，算法效果逼近离线随机森林算法。
