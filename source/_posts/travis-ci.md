---
title: 使用TravisCI进行持续集成
date: 2019-5-20 13:37:19
tags:
- CI
categories: CI
---

![TravisCI](https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_3d0f73d54a32a276d3ab019ea841d944/travis-ci.png)

> 持续集成（Continuous integration，简称CI）是一种软件开发实践。以每天小的代码改动集成替代在开发周期的末尾集成大量的代码，通过自动化的构建（包括编译，自动化测试，发布)来验证，从而尽快地发现和定位错误。让产品可以快速迭代，同时还能保持高质量。

> 持续集成往往和现代化的软件开发实践相结合，例如：Git工作流、敏捷开发、自动化测试、自动化部署等。

> 持续集成能够帮你：减少风险、减少重复过程、自动化生成可部署的软件、增强项目的可见性、建立团队对开发产品的信心。

这篇文章教你使用 [Travis CI](https://travis-ci.com "Travis CI") 自动化构建和发布你的软件产品。

<!--more-->

## 准备

Travis CI可以使用Github的OAuth登录，赋予其必要的权限，我们就能使用Github开源代码库开启构建了。

> 需要注意的是：Travis CI目前有两个域名`travis-ci.org`和`travis-ci.com`，推荐使用`com`，官方已经将`.org`合并到`.com`了。

## 配置

Travis CI通过读取项目根目录的`.travis.yml`文件获取配置信息，所以需要在工程目录下配置`.travis.yml`

```yml
language: node_js
node_js:
  - "8"
script: ./node_modules/.bin/hexo clean && ./node_modules/.bin/hexo deploy
```
- 语言环境选择`nodejs`
- 一个Job包含两个主要部分：`install`和`script`
- 我这里指定了node版本为v8
- `install`默认会执行`npm install`，在有`yarn.lock`的工程中会替代`npm`为`yarn`

以上，转载请注明出处!