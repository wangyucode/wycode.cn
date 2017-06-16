---
title: Android Studio工程应该忽略的文件及如何使用gitignore
date: 2017-6-16 14:46:22
tags: 
- Android
- Android Studio
- Git
- SVN
categories: Android
---

> 本文介绍版本控制中，Android Studio工程应该忽略的文件，以及如何使用`.gitignore`文件快速配置自动忽略，教程同时适用于Git和SVN。

<!--more-->
废话不多说直接上：
## 应该忽略的文件：
```
*.iml
.gradle
/local.properties
/.idea
.DS_Store
**/build
/captures
.externalNativeBuild
```
- `.iml`是IDEA的module描述文件，和工程配置相关，在每一个module都有，需要忽略。*表示忽略所有的`.iml`

### 使用gitignore
这是最简单的方式

