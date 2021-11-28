<template>
  <main class="home" :aria-labelledby="heroText ? 'main-title' : undefined">
    <header class="hero">
      <img v-if="heroImage" :src="heroImage" :alt="heroAlt" />

      <h1 v-if="heroText" id="main-title">
        {{ heroText }}
      </h1>

      <p v-if="tagline" class="description">
        {{ tagline }}
      </p>
    </header>

    <div class="theme-default-content custom">
      <div v-for="item in articles">
        <h2>{{ item.title }}</h2>
        <div>{{ item.dateString }}</div>
        <div>{{  item.frontmatter.categories}}</div>
        <div v-if="item.tags">{{item.tags}}</div>
        <div v-html="item.excerpt"></div>
        <a :href="item.path">阅读更多</a>
      </div> 
    </div>

    <div class="footer">
      <a href="http://beian.miit.gov.cn" target="_blank">陕ICP备15011477号</a>
      <p v-text="footer"/>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  usePageFrontmatter,
  useSiteLocaleData,
  withBase,
} from '@vuepress/client'
import { isArray } from '@vuepress/shared'
import { usePagesData } from '@vuepress/client'
import { computed, reactive } from 'vue'
import type { DefaultThemeHomePageFrontmatter } from '@vuepress/theme-default/lib/shared'

const frontmatter = usePageFrontmatter<DefaultThemeHomePageFrontmatter>()
const siteLocale = useSiteLocaleData()
const pages = usePagesData()

// hero image and title
const heroImage = computed(() => {
  if (!frontmatter.value.heroImage) {
    return null
  }

  return withBase(frontmatter.value.heroImage)
})
const heroText = computed(() => {
  if (frontmatter.value.heroText === null) {
    return null
  }
  return frontmatter.value.heroText || siteLocale.value.title || 'Hello'
})
const heroAlt = computed(
  () => frontmatter.value.heroAlt || heroText.value || 'hero'
)
const tagline = computed(() => {
  if (frontmatter.value.tagline === null) {
    return null
  }
  return (
    frontmatter.value.tagline ||
    siteLocale.value.description ||
    'Welcome to your VuePress site'
  )
})

let articles = reactive([])

Promise.all(Object.values(pages.value).map(f => f())).then((items) => {
  items = items.filter(item => !item.frontmatter.layout)
  items.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
  items.map(i => {
    i.dateString = i.frontmatter.date.substring(0,10)
    i.tags = i.frontmatter.tags ? i.frontmatter.tags.join(' '): null
    articles.push(i)
    console.log('wy->', i)
  })
  
})

// footer
const footer = computed(() => frontmatter.value.footer)
</script>
