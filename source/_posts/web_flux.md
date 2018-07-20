---
title: 理解Spring WebFlux框架中的响应式类型
date: 2018-7-20 11:28:08
tags:
- Spring
- RxJava
- WebFlux
- Java
- Kotlin
categories: Back-end
---

![Spring Boot](/images/20180720_diagram-boot-reactor.svg)

> Spring Boot 2.0 带来了Spring Framework 5 中的新的WebFlux技术，WebFlux是基于响应式非阻塞IO编程模型的技术栈。从而能够使用不同于以往基于Servlet API的阻塞式IO处理的新方式编写后台应用。

> 相比以往阻塞式IO编程，响应式编程能够获得更小的开销。因为它直接处理流，而不是单个数据。

> 函数式编程并不是一个新概念，但其与传统的命令式编程还是有很大不同。WebFlux很像RxJava，事实上它们是兼容的。

<!--more-->

## 为什么要用响应式

反应类型不是为了让你更快地处理请求或数据，实际上与常规阻塞处理相比，它们会带来很小的开销。 它们的优势在于它们能够同时提供更多请求，以及处理延迟操作，例如更有效地从远程服务器请求数据。

它们允许你通过本地处理时间和延迟来提供更好的服务质量和可预测的容量规划，而无需消耗更多资源。与等待结果时阻止当前线程的传统处理不同，Reactive API没有等待成本，仅请求它能够处理的数据量并提供立刻返回，因为它处理数据流，而不仅仅是单个元素。

## Reactive Streams

Reactor建立在Reactive Streams规范之上。 Reactive Streams由4个简单的Java接口（`Publisher`，`Subscriber`，`Subscription`和`Processor`），文本规范和`TCK`组成。它是每个现代Reactive库的基石，也是互操作性的必备条件。

Reactive Streams的核心问题是处理背压。背压是一种机制，允许接收器询问它想从发射器接收多少数据。它允许：

- 接收器只有在准备好处理数据时才开始接收数据
- 控制数据的待处理量
- 有效处理慢发射器/快速接收器或快速发射器/慢速接收器的情况
- 如果请求`Long.MAX_VALUE`元素，则从动态推取策略切换到基于推送的策略

例如，当HTTP连接速度太慢时，在从数据库扩展到HTTP响应的被动组件的管道中，数据存储库也可以减速或完全停止，直到网络容量释放为止。

乍一看，Publisher接口似乎很容易实现;但完全符合规范这样做是非常困难的，除了订阅它之外，用户无法对原始Publisher做任何事情！这就是为什么依靠反应流实现（例如Reactor）来帮助你解决此问题通常更好。

> Java 9在java.util.concurrent.Flow容器类中包含了Reactive Streams接口


参考文献：

1.[Spring官方WebFlux文档](https://docs.spring.io/spring-framework/docs/5.0.0.BUILD-SNAPSHOT/spring-framework-reference/html/web-reactive.html "Spring官方WebFlux文档")

2.[Understanding Reactive types](https://spring.io/blog/2016/04/19/understanding-reactive-types "Understanding Reactive types")