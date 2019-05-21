---
title: 从0开始开发一个评论系统
date: 2019-5-21 18:57:12
tags:
- Kotlin
- SQL
- Spring
- JPA
- Hibernate
categories: Back-end
---

![网易云音乐](http://image.woshipm.com/wp-files/2018/04/QFTkYSkExyHKCzhTTl7V.jpg)

畅言的广告有点过于流氓，所以准备开发一套评论系统，除了博客，还能用在其它APP中。

基本需求类似网易云音乐的评论，可以对引用别人的评论回复，可以点赞。

<!--more-->

## 表结构

为了保证表结构尽可能简单的同时又支持类似网易云一样功能，同时又保证可扩展性，采用单表设计，表结构（映射实体）如下。

```kotlin
@Entity
data class Comment(
        @Id
        @GeneratedValue(generator = "seq_comment")
        @SequenceGenerator(name = "seq_comment", sequenceName = "SEQ_COMMENT", allocationSize = 1, initialValue = 1)
        val id: Long = 0,
        @ApiModelProperty(value = "主题id")
        val subjectId: String = "",
        @ManyToOne
        val app: CommentApp = CommentApp(),
        @Column(length = 1023)
        val content: String? = null,
        @ApiModelProperty(value = "评论类型，1.文字评论，2.点赞，3.图片评论")
        val type: Int = 1,
        val fromUserId: String = "",
        val fromUserName: String = "匿名用户",
        val fromUserIcon: String = "",
        val toUserId: String? = null,
        val toUserName: String? = null,
        val toUserIcon: String? = null,
        val toContent: String? = null,
        val likeCount: Int = 0)
```
- 为了能够在多个app中使用，所以增加了一个`CommentApp`实体，里面包含一个name和accessKey，评论和app是多对一关系。
- `type`字段可以用来扩展为直接对文章点赞，以及图片的评论（`content`为图片地址）。
- 为了保持评论系统的独立，所以用户信息应该由使用评论的app提供，比如使用第三方登录。所以并不需要用户表。
- 这里冗余引用的评论信息，就不需要考虑嵌套查询，以及实体嵌套，循环引用的问题。只保留一层引用，当然也就只支持一对一的回复了。
- 页面展示上其实并不需要`UserId`，这里是考虑提高数据的可维护性。

## 接口

以上，转载请注明出处!