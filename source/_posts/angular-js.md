---
title: 学习AngularJS及相关的一些技术
date: 2020-9-18 16:25:08
tags:
- AngularJS
- HTML 
- CSS
- JavaScript
categories: Front-end
---

![AngularJS](https://www.angularjs.net.cn/Application/Home/View/Public/img/AngularJS.png)

> AngularJS于2009年创建，是Angular的前身，但和Angular有很多不同，以下是学习AngularJS过程中一些比较有用的知识点。

<!--more-->

## 创建AngularJS工程

创建AngularJS工程的最佳方式是clone官方的`angular-seed`项目：

```bash
git clone --depth=1 https://github.com/angular/angular-seed.git <your-project-name>
```

## html5-boilerplate

`html5-boilerplate`可以帮你写出一个优雅的HTML模版，官网：<https://html5boilerplate.com/>

## 作用域（Scopes）

Scope是一个对象，属于某个Controller，和DOM树绑定，主要有两个作用：
1. 定义数据模型
2. 监听和传播事件