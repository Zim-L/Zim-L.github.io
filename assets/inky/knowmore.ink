// Root node
VAR previous_branch = ""
-> Root

=== Root ===
~ previous_branch = "Root"
+ Industrial cooperation / 工业合作
-> Industrial
+ Academic research / 学术研究
-> Academic
+ Teaching / 教学
-> Teaching
+ Personal interests / 个人兴趣
-> Personal
TODO: Fill the initial content for each branch.

=== Industrial ===
~ previous_branch = "Industrial"
+ Professional background / 专业背景
-> Industrial_Background
+ Applications / 应用场景
-> Industrial_Applications
+ Doctorate Associates / 博士联盟
-> DA
+ Back / 返回
-> Root

=== Industrial_Background ===
~ previous_branch = "Industrial_Background"
+ Multi-objective optimisation / 多目标优化
-> Multiobjective_Optimisation
+ Optimisation problems analysis / 优化问题分析
-> Problem_Analysis
+ Skills and expertise / 技能与专长
-> Industrial_Skills
+ Back / 返回
-> Industrial

=== Industrial_Applications ===
~ previous_branch = "Industrial_Applications"
+ Engineering design / 工程设计
-> Applications_Engineering
+ Machine learning / 机器学习
-> Applications_ML
+ Complicated problems / 复杂问题
-> Complicated_problems
+ Back / 返回
-> Industrial

=== Research_content ===
~ previous_branch = "Research_content"
+ Problem visualization / 问题可视化
-> Visualisation
+ Algorithms for Complex MO Problems / 针对复杂问题的算法
-> Complicated_problems
+ MO_Algorithm_comparison / 多目标优化算法对比
-> Compare_algorithms
+ Pseudo Boolean Problems / 简单01问题
-> Pseudo_boolean_problems
+ Back / 返回
-> Industrial

=== Academic ===
~ previous_branch = "Academic"
+ Research areas / 研究领域
-> Research_content
+ Collaboration / 合作方向
-> Academic_Collaboration
+ Doctorate Associates / 博士联盟
-> DA
+ Back / 返回
-> Root

=== Teaching ===
~ previous_branch = "Teaching"
+ Mentorship style / 指导风格
-> Teaching_Style
+ Teaching experience / 教学经验
-> Teaching_Experience
+ Supporting learning / 学习支持
-> Teaching_Support
+ Back / 返回
-> Root

=== Personal ===
~ previous_branch = "Personal"
+ Hobbies / 兴趣爱好
-> Personal_Hobbies
+ Philosophy / 生活哲学
-> Personal_Philosophy
+ Back / 返回
-> Root

=== Multiobjective_Optimisation ===
~ previous_branch = "Multiobjective_Optimisation"
Multi-objective optimisation

+ Back / 返回
-> Root

=== Problem_Analysis ===
Multi-objective optimisation

+ Back / 返回 -> {previous_branch}

=== Industrial_Skills ===
My skills

+ Back / 返回 -> {previous_branch}

=== Applications_Engineering ===
Many real world

===  Applications_ML ===
Machine Learning 

=== Complicated_problems ===
Era

=== Visualisation ===
Insights

=== Algorithms ===
Design powerful algorithms

=== Compare_algorithms ===
Performance between go-to algorithms

=== Pseudo_boolean_problems ===
Enhance connection between practical and theoretical communities

=== DA ===
Doctorate

=== Academic_Collaboration ===
Welcome

=== Teaching_Style ===
My teaching

=== Teaching_Experience ===
From highschool

=== Teaching_Support ===
Teaching Support

=== Personal_Hobbies ===
Personal Hobbies

=== Personal_Philosophy ===
Philosophy

=== Book_List ===
Book_List

-> Root