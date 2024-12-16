VAR health = 100
VAR gold = 50
VAR knowledge = 0

-> Title

=== Title ===
CLEAR

欢迎来到测试冒险游戏！

+ [开始游戏] -> Intro
+ [关于游戏] -> About
+ [退出游戏] -> END

=== About ===
CLEAR

这是一个用来测试 MathJax 和 Mermaid 的游戏。
通过不同的操作触发公式计算和可视化图表。

+ [返回标题] -> Title

=== Intro ===
CLEAR

欢迎来到这个世界！
你可以选择接下来做什么：
+ [探索附近的村庄] -> ExploreVillage
+ [进入神秘的洞穴] -> EnterCave
+ [研究古老的卷轴] -> StudyScroll

=== ExploreVillage ===
CLEAR

你在村庄里找到了一些金币！
~ gold += 20

$$Gold = {gold}$$

Mermaid 数据：
mermaid:villageGraph

![testImage](/assets/images/me.jpg)

+ [返回冒险选择] -> Intro

=== EnterCave ===
CLEAR

你进入洞穴，遇到了一只怪物。
~ health -= 20
~ knowledge += 10

Mermaid 数据：
mermaid:caveGraph

+ [返回冒险选择] -> Intro

=== StudyScroll ===
CLEAR

你认真研究了古老的卷轴，获得了新的知识！
~ knowledge += 20

Mermaid 数据：
mermaid:scrollGraph {knowledge} 666

+ [返回冒险选择] -> Intro

=== END ===
CLEAR

游戏结束！感谢你的游玩！

* [重新开始] -> Title
