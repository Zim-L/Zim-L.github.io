function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener("DOMContentLoaded", function () {
    const storyContainer = document.getElementById("story-container");
    
    const storyFile = getUrlParameter('storyFile') || '/assets/json/story.json';
    const mermaidFile = getUrlParameter('mermaidFile') || '/assets/json/mermaidCommands.json';
    
    // 加载 Mermaid 命令模板
    let mermaidTemplates = {};
    fetch(mermaidFile)
        .then(response => response.json())
        .then(data => {
            mermaidTemplates = data;
            console.log('Mermaid templates loaded:', mermaidTemplates);
        })
        .catch(error => console.error('Error loading mermaid templates:', error));

    // 加载故事 JSON 文件
    fetch(storyFile)
        .then(response => response.json())
        .then(storyContent => {
            const story = new inkjs.Story(storyContent);

            function showNextContent() {
                // 清空旧的选择项
                document.querySelectorAll('.choice-button').forEach(btn => btn.remove());

                while (story.canContinue) {
                    let content = story.Continue();
                    console.log('Story content:', content);

                    // 检查 Mermaid 数据
                    const mermaidMatch = content.match(/mermaid:(\S+)(?:\s+(.*))?/);
                    if (mermaidMatch) {
                        const mermaidId = mermaidMatch[1];
                        const mermaidVars = mermaidMatch[2] ? mermaidMatch[2].split(' ') : [];
                        console.log('Mermaid command detected:', mermaidId, mermaidVars);

                        // 找到对应的 Mermaid 模板
                        const mermaidTemplate = mermaidTemplates[mermaidId];
                        if (mermaidTemplate) {
                            let mermaidData = mermaidTemplate;

                            // 替换占位符 #1, #2, ...
                            mermaidVars.forEach((value, index) => {
                                mermaidData = mermaidData.replace(new RegExp(`#${index + 1}`, 'g'), value);
                            });

                            console.log('Generated Mermaid data:', mermaidData);

                            // 创建 Mermaid 容器
                            const graphContainer = document.createElement('div');
                            graphContainer.className = 'mermaid';
                            graphContainer.textContent = mermaidData;
                            storyContainer.appendChild(graphContainer);

                            // 渲染 Mermaid 图表
                            mermaid.init(undefined, '.mermaid');
                        } else {
                            console.error('Mermaid template not found for:', mermaidId);
                        }
                    } else if (content.includes('$')) {
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = content;
                        storyContainer.appendChild(paragraph);

                        // 渲染 MathJax 公式
                        if (typeof MathJax !== 'undefined') {
                            console.log('Rendering MathJax...');
                            MathJax.typesetPromise().catch(err => console.log('MathJax render error', err));
                        }
                    } else if (content.startsWith('CLEAR')) {
                        storyContainer.innerHTML = '';
                    } else if (content.startsWith('INCLUDE ')) {
                        const otherFile = content.substring("INCLUDE ".length).trim();
                        const markdownText = await fetch('main.md').then(res => res.text());
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = marked.parse(markdownText);
                        storyContainer.appendChild(paragraph);
                        
                    } else {
                        // 普通文本内容
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = marked.parse(content);
                        storyContainer.appendChild(paragraph);
                    }

                    
                }

                // 显示选择项
                story.currentChoices.forEach((choice, index) => {
                    const button = document.createElement('button');
                    button.textContent = choice.text;
                    button.classList.add('choice-button');
                    button.onclick = () => {
                        story.ChooseChoiceIndex(index);
                        showNextContent();
                    };
                    storyContainer.appendChild(button);
                });
            }

            // 初始显示内容
            showNextContent();
        })
        .catch(error => {
            console.error('Error loading the story:', error);
        });
});
