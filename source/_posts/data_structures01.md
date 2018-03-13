---
title:  浙大数据结构学习笔记01
date: 2018年3月8日 13:14:57
tags:
- C
categories: Data Structures
---


> 程序=数据结构+算法。

浙江大学数据结构是国家精品课程，于2018年3月开学，2018年6月学期结束。

<!--more-->

## 实验1：给出数字N，要求程序输出1~N的整数

使用Java测试：输出10000次，for循环耗时114ms，递归耗时61ms！100000次递归栈溢出崩溃，for循环耗时900ms。

```java

public class Main {

    public static void main(String[] args) {
   		// write your code here
        Main m = new Main();
        long time = System.currentTimeMillis();
        m.printN(10000);
        System.out.println("time="+(System.currentTimeMillis()-time));
        time = System.currentTimeMillis();
        m.printNR(10000);
        System.out.println("time="+(System.currentTimeMillis()-time));
    }

    private void printNR(int n) {
        if(n>0) {
            printNR(n - 1);
            System.out.println(n);
        }
    }

    private void printN(int n){
        for(int i= 1;i<=n;i++){
            System.out.println(i);
        }
    }
}
```

用C测试：输出100000次，for循环耗时149ms，递归耗时148ms，100000次递归耗时150ms，100万次

```C
#include <stdio.h>
#include <time.h>


void printN(int n);
void printNC(int n);

int main(){
    clock_t startTime = clock();
    printN(100000);
    //double diff = ;
    printf("%f seconds\n",difftime(clock(),startTime)/CLOCKS_PER_SEC);
    
    
}

void printN(int n){
    for(int i=1;i<=n;i++){
        printf("%d\n",i);
    }
}


void printNC(int n){
    if(n){
        printNC(n-1);
        printf("%d\n",n);
    }

}

```

- 总结:

1. ~~C语言程序运行效率至少在Java的10倍以上~~（C程序计时不准，需要重新测试）
2. 递归的空间效率很差，容易堆栈溢出崩溃。
3. Java环境递归耗时是for循环的1/2。
4. C语言环境递归耗时和for循环差不多。

## 实验2：计算多项式的值

![多项式](/blog/images/20180313_data_structure.png)

```java
public class Test02 {

    public static void main(String[] args) {
        // write your code here
        Test02 t = new Test02();
        long time = System.currentTimeMillis();
        for(int i=0;i<100000;i++) {
            t.f1(1.1);
        }
        System.out.println("time=" + (System.currentTimeMillis() - time));
        time = System.currentTimeMillis();
        for(int i=0;i<100000;i++) {
            t.f2(1.1);
        }
        System.out.println("time=" + (System.currentTimeMillis() - time));
    }

    private double f1(double x) {
        double v = 1f;
        for (int i = 1; i <= 100; i++) {
            v += Math.pow(x,i) / i;
        }
        return v;
    }

    //f(x) = 1+x(1/1+x(1/2+x(1/3+....x(1/100))))

    private double f2(double x) {
        double v = x/100;
        int i = 100;
        while (i>1) {
            v = x*(1f/(i-1)+v);
            i--;
        }
        return v+1;
    }
}

```

- 总结：
1. 循环10万次测试，方法1，耗时1016ms，方法2耗时16ms。约100倍的效率差距
2. 计算时一定要注意，整形和浮点型`v = x*(1f/(i-1)+v);`
3. 方法1，慢就慢在`pow`函数上
4. 替换pow函数为计数循环`x *=x`耗时500ms，差距缩小至约20倍。

## 