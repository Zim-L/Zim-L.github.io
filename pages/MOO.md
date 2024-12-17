---
layout : single
title : Multiobjective Optimisation 多目标优化
permalink: /MOO/
hide : true
wide : true
author_profile: true
classes: wide
toc : true
---

## 什么是多目标问题？

<img src="/assets/images/MOIllustration.png" alt="示例图" width="400" style="display: block; margin: auto;">


想象一下，你想花更少的**钱（Cost）**，但又希望耗更少的**能量（Energy）**来完成一件事。两个目标互相冲突：要花更少的钱，可能会耗费更多能量；要省能量，成本又可能增加。

这种同时优化多个冲突目标的问题，就是**多目标问题**。

## 多目标问题为什么重要？
现实生活中太多这样的例子了。
1. 造车：既要**成本低**，又要**安全**，还要**环保**。高中低端车型要各自“取舍”平衡点
2. 时间管理：既要工作，又要陪家人，还要自己有娱乐？
3. 购物：钱不多，想买的很多。有的货中看，有的货中用，怎么买又开心、又实用？
  
## 多目标问题为什么难？
**多目标优化就是去找各种各样的平衡方案**
多目标问题没有唯一完美的答案，必须要**取舍**，像图里的绿色解，有便宜的有省能量的。
很多解两个目标都不太行，就像图里的粉色解，需要赶紧“优化”掉。
但是这些差的解太多了，想要找到1个最优解都未必容易，更何况找到很多个？

想要找到很多个最优解，需要**策略**和**工具**。
找完之后，要帮助决策者选出最合适的那1个（各方平衡）或几个（低中高端）。

简单来讲，多目标优化是一门既要又要的艺术。

--- 

## What is Multi-Objective Optimization?  
Imagine you want to **spend less money (Cost)** but also **use less energy (Energy)** to complete a task. These two goals often conflict: reducing costs may increase energy consumption, and saving energy might raise costs.  

**Multi-objective optimization** is about balancing these conflicting goals simultaneously.  


## **Why is it Important?**  
**Real-life is full of such examples**:  

1. **Engineering Design** (e.g., Car Manufacturing):  
   - You need to balance **low cost**, **safety**, and **eco-friendliness**.  
   - Different car models (low, mid, high-end) require unique trade-offs.  

2. **Time Management**:  
   - You want to work, spend time with family, and enjoy hobbies.  
   - Work is often fixed, but balancing family and personal time is tricky.  

3. **Shopping Decisions**:  
   - Limited budget, many desires: you need to prioritize.  
   - Some products **look good**, others **perform well**—how do you pick the one that’s both satisfying and practical?  

## **Why is it Difficult?**  
1. **No Single Perfect Answer**:  
   - Trade-offs are inevitable. You search for **balanced solutions** like the green points in the graph: cost-efficient *and* energy-saving.  

2. **Too Many Poor Solutions**:  
   - Many options (like the pink points) fail to perform well on either goal and need to be eliminated.  

3. **Finding Many Optimal Solutions is Challenging**:  
   - Identifying just one best solution is hard, let alone discovering multiple optimal ones.  
   - This requires **smart strategies** and **effective tools**.  

4. **Decision-Making Comes Next**:  
   - After finding optimal solutions, decision-makers choose the most suitable one(s) based on their priorities (e.g., high-end, mid-range, low-cost).  

**In short, multi-objective optimization is the art of achieving “both-and” in a world of trade-offs.**  