---
title:  数据结构与算法学习笔记03
date: 2018-3-26 13:25:27
tags:
- C
categories: Data Structures and Algorithms
---


> 树状结构的基础是二叉树，二叉树即度为2的树。

## 二叉树的链表结构

```c
typedef struct TNode *Position;
typedef Position BinTree; /* 二叉树类型 */
struct TNode{ /* 树结点定义 */
    ElementType Data; /* 结点数据 */
    BinTree Left;     /* 指向左子树 */
    BinTree Right;    /* 指向右子树 */
};
```


<!--more-->

## 作业1：树的同构

给定两棵树T1和T2。如果T1可以通过若干次左右孩子互换就变成T2，则我们称两棵树是“同构”的。例如图1给出的两棵树就是同构的，因为我们把其中一棵树的结点A、B、G的左右孩子互换后，就得到另外一棵树。而图2就不是同构的。
图1：
![图1](/blog/images/20180326_data_structures03_1.png)
图2：
![图2](/blog/images/20180326_data_structures03_2.png)
现给定两棵树，请你判断它们是否是同构的。

- 输入格式:

输入给出2棵二叉树树的信息。对于每棵树，首先在一行中给出一个非负整数N (≤10)，即该树的结点数（此时假设结点从0到N−1编号）；随后N行，第i行对应编号第i个结点，给出该结点中存储的1个英文大写字母、其左孩子结点的编号、右孩子结点的编号。如果孩子结点为空，则在相应位置上给出`-`。给出的数据间用一个空格分隔。注意：题目保证每个结点中存储的字母是不同的。

- 输出格式:

如果两棵树是同构的，输出`Yes`，否则输出`No`。

- 输入样例1（对应图1）：

```bash
8
A 1 2
B 3 4
C 5 -
D - -
E 6 -
G 7 -
F - -
H - -
8
G - 4
B 7 6
F - -
A 5 1
H - -
C 0 -
D - -
E 2 -
```

- 输出样例1:

```bash
Yes
```
- 输入样例2（对应图2）：

```bash
8
B 5 7
F - -
A 0 3
C 6 -
H - -
D - -
G 4 -
E 1 -
8
D 6 -
B 5 -
E - -
H - -
C 0 2
G - 3
F - -
A 1 4
```
- 输出样例2:

```bash
No
```

- 实现：

```java
public class Main {
    public static void main(String args[]) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        //读第一个树节点
        int n_a = 0;
        n_a = Integer.parseInt(reader.readLine());

        String[] inputs_a = new String[n_a];
        List<Node> nodes_a = new ArrayList<>(n_a);

        for (int i = 0; i < n_a; i++) {
            inputs_a[i] = reader.readLine();
        }


        int n_b = 0;
        n_b = Integer.parseInt(reader.readLine());

        String[] inputs_b = new String[n_b];
        List<Node> nodes_b = new ArrayList<>(n_b);

        for (int i = 0; i < n_b; i++) {
            inputs_b[i] = reader.readLine();
        }

        if (n_a != n_b) {
            System.out.println("No");
            return;
        }

        addNodes(inputs_a, nodes_a);
        addNodes(inputs_b, nodes_b);

        if(inputs_a.length==1&&!Objects.equals(nodes_a.get(0).data,nodes_b.get(0).data)){
            System.out.println("No");
            return;
        }

        for (Node node_a : nodes_a) {
            for (Node node_b : nodes_b) {
                if (Objects.equals(node_a.data, node_b.data)) {
                    if (!((Objects.equals(node_a.left, node_b.left) && Objects.equals(node_a.right, node_b.right))
                            || (Objects.equals(node_a.left, node_b.right) && Objects.equals(node_a.right, node_b.left)))) {
                        System.out.println("No");
                        return;
                    }
                }
            }
        }

        System.out.println("Yes");
    }


    private static void addNodes(String[] inputs, List<Node> nodes) {
        for (String input : inputs) {
            Node n = new Node();
            String[] lineArg = input.split(" ");
            n.data = lineArg[0];
            if (!Objects.equals("-", lineArg[1])) {
                int left_num = Integer.parseInt(lineArg[1]);
                n.left = inputs[left_num].split(" ")[0];
            }
            if (!Objects.equals("-", lineArg[2])) {
                int right_num = Integer.parseInt(lineArg[2]);
                n.right = inputs[right_num].split(" ")[0];
            }
            nodes.add(n);
        }
    }

    static class Node {
        String data;
        String left;
        String right;
    }
}

```

- 总结:

1. 利用二叉树的数据结构可以解决这个问题。
2. 这里我采用了投机取巧的办法，并没有建立树状结构，而是把每个节点进行比较，唯一需要处理的特例就是同唯一父节点值不同的情况。

## 作业2：List Leaves（25 分）

Given a tree, you are supposed to list all the leaves in the order of top down, and left to right.

- Input Specification:

Each input file contains one test case. For each case, the first line gives a positive integer N (≤10) which is the total number of nodes in the tree -- and hence the nodes are numbered from 0 to N−1. Then N lines follow, each corresponds to a node, and gives the indices of the left and right children of the node. If the child does not exist, a "-" will be put at the position. Any pair of children are separated by a space.

- Output Specification:

For each test case, print in one line all the leaves' indices in the order of top down, and left to right. There must be exactly one space between any adjacent numbers, and no extra space at the end of the line.

- Sample Input:

```bash
8
1 -
- -
0 -
2 7
- -
- -
5 -
4 6
```
Sample Output:


```bash
4 1 5
```

- 实现：

```java
public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        PolyNode first1 = getInput(scanner);
        PolyNode first2 = getInput(scanner);
        PolyNode result1 = add(first1, first2);
        PolyNode result2 = multiply(first1, first2);
        print(result2);
        print(result1);

    }

    /**
     * 逐项插入算法
     *
     * @param first1
     * @param first2
     * @return
     */
    private static PolyNode multiply(PolyNode first1, PolyNode first2) {
        PolyNode p1 = first1;
        PolyNode p2 = first2;

        PolyNode first = new PolyNode(); //结果，先构造一个空的头节点
        PolyNode rear = first; //将尾部指向这个头
        while (p2 != null) { //先用第一项乘以p2构造一个初始多项式
            PolyNode next = new PolyNode(); //构造一个新节点
            next.coef = p1.coef * p2.coef; //系数相乘
            next.expon = p1.expon + p2.expon; //指数相加
            rear.next = next; //尾部指针指向新的节点
            rear = next; //新尾部等于新添加的节点
            p2 = p2.next; //移动p2指针
        }
        p1 = p1.next; //把p1指针向后挪1位
        while (p1 != null) {
            p2 = first2; //将p2指针归位
            rear = first; //尾部指针归位
            while (p2 != null) {
                int e = p1.expon + p2.expon; //指数相加
                int c = p1.coef * p2.coef; //系数相乘
                while (rear.next != null && rear.next.expon > e) { //寻找比当前指数小或者等的位置
                    rear = rear.next; //rear 往后挪
                }
                if (rear.next != null && rear.next.expon == e) { //挪了之后如果下一项存在，且指数相等，则合并系数
                    if (rear.next.coef + c == 0) { //和下一项系数相加等于0，则删掉这一项
                        rear.next = rear.next.next;
                    } else { //系数相加不为0，就要合并系数
                        rear.next.coef += c;
                    }
                } else { //指数不等，需要创建一个新节点插入
                    PolyNode newPoly = new PolyNode(); //构造一个新节点
                    newPoly.coef = c;
                    newPoly.expon = e;
                    newPoly.next = rear.next;//新插入的节点下一个=当前尾部的下一个
                    rear.next = newPoly; //当前尾部的下一个等于新节点
                }

                p2 = p2.next;//p2处理完毕，将p2挪到下一个
            }
            p1 = p1.next;//p2遍历完毕，将p1往后挪
        }
        first = first.next; //将头部挪到真实的头部位置，Java会自动回收没有引用的头节点

        return first;
    }

    private static void print(PolyNode result) {
        PolyNode p = result;
        StringBuilder sb = new StringBuilder();
        if (p == null) { //零多项式输出0 0
            sb.append("0 0");
        }
        boolean isFirst = true;
        while (p != null) {
            if (!isFirst)
                sb.append(' ');
            sb.append(p.coef);
            sb.append(' ');
            sb.append(p.expon);
            p = p.next;
            isFirst = false;
        }
        System.out.println(sb.toString());
    }

    private static PolyNode add(PolyNode first1, PolyNode first2) {
        PolyNode p1 = first1;
        PolyNode p2 = first2;

        PolyNode first = new PolyNode(); //结果，先构造一个空的头节点
        PolyNode rear = first; //将尾部指向这个头
        while (p1 != null && p2 != null) { //当两个指针都不为空时
            if (p1.coef == 0) { //系数为0,直接省略
                p1 = p1.next;
            } else if (p2.coef == 0) {
                p2 = p2.next;
            } else if (p1.expon == p2.expon) { //指数相等，则系数相加后串到后面
                int coef = p1.coef + p2.coef;  //系数相加
                if (coef != 0) {
                    PolyNode next = new PolyNode(); //构造一个新节点
                    next.coef = coef;
                    next.expon = p1.expon;
                    rear.next = next; //尾部指针指向新的节点
                    rear = next; //新尾部等于新添加的节点
                }
                p1 = p1.next; //移动指针
                p2 = p2.next;
            } else if (p1.expon > p2.expon) {//指数大的串到后面
                PolyNode next = new PolyNode(); //构造一个新节点
                next.coef = p1.coef;
                next.expon = p1.expon;
                rear.next = next; //尾部指针指向新的节点
                rear = next; //新尾部等于新添加的节点
                p1 = p1.next; //移动指针
            } else {
                PolyNode next = new PolyNode(); //构造一个新节点
                next.coef = p2.coef;
                next.expon = p2.expon;
                rear.next = next; //尾部指针指向新的节点
                rear = next; //新尾部等于新添加的节点
                p2 = p2.next; //移动指针
            }
        }

        while (p1 != null) { //p1没完，把所有p1追加到后面
            if (p1.coef != 0) { //系数不为0才，添加，否则继续找因为后面可以能还有系数不为0的
                PolyNode next = new PolyNode(); //构造一个新节点
                next.coef = p1.coef;
                next.expon = p1.expon;
                rear.next = next; //尾部指针指向新的节点
                rear = next; //新尾部等于新添加的节点
            }
            p1 = p1.next; //移动指针
        }

        while (p2 != null && p2.coef != 0) { //p2没完，把所有p2追加到后面
            if (p2.coef != 0) { //系数不为0才，添加，否则继续找因为后面可以能还有系数不为0的
                PolyNode next = new PolyNode(); //构造一个新节点
                next.coef = p2.coef;
                next.expon = p2.expon;
                rear.next = next; //尾部指针指向新的节点
                rear = next; //新尾部等于新添加的节点
            }
            p2 = p2.next; //移动指针
        }
        first = first.next; //将头部挪到真实的头部位置，Java会自动回收没有引用的头节点
        return first;
    }

    private static PolyNode getInput(Scanner scanner) {
        int count = scanner.nextInt(); //得到总项数
        PolyNode first = new PolyNode(); //构造一个空的头
        PolyNode rear = first; //构造一个尾部的指针
        while (count > 0) {
            PolyNode next = new PolyNode(); //读取一个节点
            next.coef = scanner.nextInt();
            next.expon = scanner.nextInt();
            rear.next = next; //将尾部的指针指向读到的这个节点
            rear = next; //将尾部指针挪到新添加的节点
            count--; //循环
        }
        first = first.next; //将头部挪到真实的头部位置，Java会自动回收没有引用的头节点
        return first;
    }


    static class PolyNode {
        int coef;
        int expon;
        PolyNode next;
    }
}

```

- 总结：

1. 逐项插值算法；
2. 单个对象保存一个当前类的引用可以当作链表来使用；
3. 原输入的链表不要取修改它的内部对象引用或者变量值；

## 作业1：Reversing Linked List（25 分）

Given a constant K and a singly linked list L, you are supposed to reverse the links of every K elements on L. For example, given L being 1→2→3→4→5→6, if K=3, then you must output 3→2→1→6→5→4; if K=4, you must output 4→3→2→1→5→6.

Input Specification:

Each input file contains one test case. For each case, the first line contains the address of the first node, a positive N (≤10
​5
​​ ) which is the total number of nodes, and a positive K (≤N) which is the length of the sublist to be reversed. The address of a node is a 5-digit nonnegative integer, and NULL is represented by -1.

Then N lines follow, each describes a node in the format:

`Address Data Next`
where `Address` is the position of the node, `Data` is an integer, and `Next` is the position of the next node.

Output Specification:

For each case, output the resulting ordered linked list. Each node occupies a line, and is printed in the same format as in the input.

Sample Input:
```bash
00100 8 4
00000 4 99999
00100 1 12309
68237 6 77777
33218 3 00000
77777 7 88888
99999 5 68237
12309 2 33218
88888 8 -1
```
Sample Output:
```bash
00000 4 33218
33218 3 12309
12309 2 00100
00100 1 99999
99999 5 68237
68237 6 -1
```

- 实现：

```java
package cn.wycode;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Objects;
import java.util.Stack;

public class Main {
    public static void main(String args[]) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        //读第一行
        String[] line1Array = getStringArray(reader);
        String firstAddress = line1Array[0];
        int count = Integer.parseInt(line1Array[1]);
        int k = Integer.parseInt(line1Array[2]);

        //读取所有节点
        ArrayList<Node> nodes = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            String[] lineArray = getStringArray(reader);
            Node node = new Node();
            node.address = lineArray[0];
            node.data = Integer.parseInt(lineArray[1]);
            node.nextAddress = lineArray[2];
            nodes.add(node);
        }


        //按链表顺序加入队列
        LinkedList<Node> queue = new LinkedList<>();
        String address = firstAddress;
        while (!address.equals("-1")) {
            for (int i = 0; i < nodes.size(); i++) { //循环匹配地址
                Node n = nodes.get(i);
                if (Objects.equals(address, n.address)) { //找到则加入队列
                    queue.add(n);
                    address = n.nextAddress; //查找地址赋值为当前节点的下一个地址
                    nodes.remove(n); //处理完的移出节点数组，减少循环量
                    break;
                }
            }
        }

        Stack<Node> stack = new Stack<>();
        boolean isCanConvert = queue.size() >= k; //是否够反转
        while (!queue.isEmpty()) { //循环出队列
            Node n = queue.remove();
            if (isCanConvert) { //够反转则压入堆栈
                stack.push(n);
                if (stack.size() == k) { //压够反转数量就全部输出
                    isCanConvert = queue.size() >= k; //再次检查是否够反转
                    while (!stack.isEmpty()) {
                        //重新赋值next
                        Node nStack = stack.pop();
                        if (stack.isEmpty()) { //如果栈里没了，地址就等于队列的下一个
                            if (queue.isEmpty()) { //队列也没了，地址等于-1
                                nStack.nextAddress = "-1";
                            } else {
                                //如果剩下的还能反转
                                if (isCanConvert) {
                                    nStack.nextAddress = queue.get(k - 1).address;
                                } else {
                                    nStack.nextAddress = queue.peek().address;
                                }
                            }
                        } else {
                            nStack.nextAddress = stack.peek().address;
                        }
                        print(nStack);
                    }
                }
            } else { //不够反转 直接输出节点
                print(n);
            }
        }

    }


    private static void print(Node n) {
        System.out.println(n.address + " " + n.data + " " + n.nextAddress);
    }

    private static String[] getStringArray(BufferedReader reader) {
        String line1 = null;
        try {
            line1 = reader.readLine();
        } catch (Exception ignore) {
        }
        return line1.split(" ");
    }

    static class Node {
        String address;
        int data;
        String nextAddress;
    }
}

```


- 总结：

1. 利用队列和栈解决顺序问题

## 作业2：Pop Sequence（25 分）


Given a stack which can keep M numbers at most. Push N numbers in the order of 1, 2, 3, ..., N and pop randomly. You are supposed to tell if a given sequence of numbers is a possible pop sequence of the stack. For example, if M is 5 and N is 7, we can obtain 1, 2, 3, 4, 5, 6, 7 from the stack, but not 3, 2, 1, 7, 5, 6, 4.

Input Specification:

Each input file contains one test case. For each case, the first line contains 3 numbers (all no more than 1000): M (the maximum capacity of the stack), N (the length of push sequence), and K (the number of pop sequences to be checked). Then K lines follow, each contains a pop sequence of N numbers. All the numbers in a line are separated by a space.

Output Specification:

For each pop sequence, print in one line "YES" if it is indeed a possible pop sequence of the stack, or "NO" if not.

Sample Input:
```bash
5 7 5
1 2 3 4 5 6 7
3 2 1 7 5 6 4
7 6 5 4 3 2 1
5 6 4 3 7 2 1
1 7 6 5 4 3 2
```
Sample Output:
```bash
YES
NO
NO
YES
NO
```