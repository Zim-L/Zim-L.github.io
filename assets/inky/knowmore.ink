// Root node
VAR previous_branch = ""
-> Root

=== Root ===
CLEAR
~ previous_branch = "Root"
+ Industrial applications / 工业应用
-> Industrial
+ Academic research / 学术研究
-> Academic
+ Teaching / 教学
-> Teaching
+ Personal interests / 个人兴趣
-> Personal


=== Industrial ===

CLEAR
Content目录 - Industrial工业应用
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

CLEAR
Content目录 - Industrial工业应用 - Professional background专业背景
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

CLEAR
Content目录 - Industrial工业应用 - Applications应用场景
~ previous_branch = "Industrial_Applications"
+ Engineering design / 工程设计
-> Applications_Engineering
+ Machine learning / 机器学习
-> Applications_ML
+ Complicated problems / 复杂问题
-> Complicated_problems
+ Back / 返回
-> Industrial


=== Academic ===

CLEAR
Content目录 - Academic research学术研究
~ previous_branch = "Academic"
+ Research areas / 研究领域
-> Research_content
+ Collaboration / 合作方向
-> Academic_Collaboration
+ Doctorate Associates / 博士联盟
-> DA
+ Back / 返回
-> Root


=== Research_content ===

CLEAR
Content目录 - Academic research学术研究 - Research content研究内容
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

=== Teaching ===

CLEAR
Content目录 - Teaching教学
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

CLEAR
Content目录 - Personal interests个人兴趣
~ previous_branch = "Personal"
+ Hobbies / 兴趣爱好
-> Personal_Hobbies
+ Philosophy / 生活哲学
-> Personal_Philosophy
+ Books List / 书单
-> Book_List
+ Back / 返回
-> Root

=== Multiobjective_Optimisation ===
~ previous_branch = "Multiobjective_Optimisation"
IMPORT /MOO

+ Back / 返回 
-> Industrial_Background

=== Problem_Analysis ===
Multi-objective optimisation

+ Back / 返回
-> Industrial_Background

=== Industrial_Skills ===
My skills

+ Back / 返回 
-> Industrial_Background

=== Applications_Engineering ===
Many real world

+ Back / 返回 
-> Industrial_Applications

===  Applications_ML ===
Machine Learning 

+ Back / 返回 
-> Industrial_Applications

=== Complicated_problems ===
Era

+ Back / 返回 
-> Industrial_Applications

=== Visualisation ===
Insights

+ Back / 返回 
-> Research_content

=== Algorithms ===
Design powerful algorithms

+ Back / 返回 
-> Research_content

=== Compare_algorithms ===
Performance between go-to algorithms

+ Back / 返回 
-> Research_content

=== Pseudo_boolean_problems ===
Enhance connection between practical and theoretical communities

+ Back / 返回 
-> Research_content

=== DA ===
Doctorate

{ previous_branch == "Industrial":
  + Back / 返回 
  -> Industrial
- else:
  + Back / 返回 
  -> Academic
}

=== Academic_Collaboration ===
Welcome

+ Back / 返回 
-> Academic

=== Teaching_Style ===
My teaching

+ Back / 返回 
-> Teaching

=== Teaching_Experience ===
From highschool

+ Back / 返回 
-> Teaching

=== Teaching_Support ===
Teaching Support

+ Back / 返回 
-> Teaching

=== Personal_Hobbies ===
Personal Hobbies

+ Back / 返回 
-> Personal

=== Personal_Philosophy ===
Philosophy

+ Back / 返回 
-> Personal

=== Book_List ===
Book_List

+ Back / 返回 
-> Personal


CLEAR
-> Root