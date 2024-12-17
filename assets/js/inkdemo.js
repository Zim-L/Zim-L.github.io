function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
    return urlParams.get(name);
}

document.addEventListener("DOMContentLoaded", function () {
    const storyContainer = document.getElementById("story-container");
    
    const scripts = document.getElementsByTagName('script');
    // const currentScript = scripts[scripts.length - 1]; // The last script tag added
    const currentScript = document.querySelector('script[src="/assets/js/inkdemo.js"]')
    console.log("Script tag:", currentScript); 
    const storyFile = currentScript.getAttribute("storyFile");
    const mermaidFile = currentScript.getAttribute("mermaidFile");

    console.log("Story File:", storyFile);
    console.log("Mermaid File:", mermaidFile);
    
    //const storyFile = getUrlParameter('storyFile') || '/assets/json/story.json';
    //const mermaidFile = getUrlParameter('mermaidFile') || '/assets/json/mermaidCommands.json';
    
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
                // Empty old options
                document.querySelectorAll('.choices-button').forEach(btn => btn.remove());

                while (story.canContinue) {
                    let content = story.Continue();
                    console.log('Story content:', content);
                    
                    // Skip content that is purely the echoed choice
                    if (story.currentChoices.length === 0 && content.trim() === "") {
                        continue; // Ignore empty or non-essential echoed content
                    }

                    // Match mermaid format
                    const mermaidMatch = content.match(/mermaid:(\S+)(?:\s+(.*))?/);
                    if (mermaidMatch) {
                        const mermaidId = mermaidMatch[1];
                        const mermaidVars = mermaidMatch[2] ? mermaidMatch[2].split(' ') : [];
                        console.log('Mermaid command detected:', mermaidId, mermaidVars);

                        // Find corresponding mermaid commands
                        const mermaidTemplate = mermaidTemplates[mermaidId];
                        if (mermaidTemplate) {
                            let mermaidData = mermaidTemplate;

                            // Subsitute #1, #2, ... as parameters for mermaid
                            mermaidVars.forEach((value, index) => {
                                mermaidData = mermaidData.replace(new RegExp(`#${index + 1}`, 'g'), value);
                            });

                            console.log('Generated Mermaid data:', mermaidData);

                            // Create mermaid container
                            const graphContainer = document.createElement('div');
                            graphContainer.className = 'mermaid';
                            graphContainer.textContent = mermaidData;
                            storyContainer.appendChild(graphContainer);

                            // Render mermaid
                            mermaid.init(undefined, '.mermaid');
                        } else {
                            console.error('Mermaid template not found for:', mermaidId);
                        }
                    } else if (content.includes('$')) {
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = content;
                        storyContainer.appendChild(paragraph);

                        // Render Mathjax
                        if (typeof MathJax !== 'undefined') {
                            console.log('Rendering MathJax...');
                            MathJax.typesetPromise().catch(err => console.log('MathJax render error', err));
                        }
                    } else if (content.startsWith('CLEAR')) {
                        storyContainer.innerHTML = '';
                    } else if (content.startsWith('IMPORT ')) {
                        const otherFile = content.substring("IMPORT ".length).trim();
                        const markdownText = fetch(otherFile)
                        .then(response => response.text()) // Wait for the text content
                        .then(markdownContent => {
                            const paragraph = document.createElement('p');
                            const parsedContent = marked.parse(markdownContent);
                            console.log('Showing', parsedContent);
                            paragraph.innerHTML = parsedContent;
                            storyContainer.appendChild(paragraph);
                        })
                        .catch(error => console.error('Error fetching or rendering Markdown:', error));
                        
                    } else {
                        // Normal Markdown 
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = marked.parse(content);
                        storyContainer.appendChild(paragraph);
                    }

                    
                }

                // Show options
                const choicesContainer = document.createElement('ol'); // Ordered list
                choicesContainer.classList.add('choices-button'); // Custom CSS class for styling
                
                // Create each choice as a list item with a link
                story.currentChoices.forEach((choice, index) => {
                    const listItem = document.createElement('li'); // List item
                    const link = document.createElement('a'); // Link inside the list item
                
                    link.href = "#"; // Makes the link clickable without navigating
                    link.textContent = `${choice.text}`; // Enumerated label
                    link.onclick = (event) => {
                        event.preventDefault(); // Prevent default link behavior
                        story.ChooseChoiceIndex(index);
                        showNextContent(); // Update the content
                    };
                    link.classList.add('choices-button')
                
                    listItem.appendChild(link);
                    choicesContainer.appendChild(listItem);
                });
                
                // Add the choices container to the story container
                storyContainer.appendChild(choicesContainer);
            }

            showNextContent();
        })
        .catch(error => {
            console.error('Error loading the story:', error);
        });
});
