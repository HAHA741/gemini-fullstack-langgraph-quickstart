
generate_outline_prompt="""
你是一名擅长漫画分镜设计的故事策划师。

请根据以下故事文本，对内容进行【分镜预处理】，将故事拆解为一组“画面节点”，用于后续生成正式的漫画分镜（PanelInfo）。

【分镜预处理目标】
- 保证故事内容完整，不遗漏任何关键情节或信息
- 明确每一个画面应该“画什么”
- 为后续精细化分镜（scene / action / expression / text）提供清晰依据

【分镜预处理规则】
1. 按故事发展顺序拆分画面节点，必要时合并或拆分段落
2. 每个节点对应一个潜在的漫画画面（Panel）
3. 重点关注以下信息：
   - 发生了什么关键事件
   - 角色在这一刻的主要动作与状态
   - 情绪变化或笑点触发点
4. 不需要写具体台词，不做镜头语言（如特写、远景）设计
5. 不做绘画风格描述，仅关注叙事与画面内容
6. 节点数量根据故事长度自动调整，确保节奏自然
7. 只返回画面节点列表，不要返回其他内容

【输出格式】
以有序列表输出，每条为一个“画面节点”，结构如下：

1. 画面节点 1：
   - 情节要点：……
   - 画面核心：这一格主要表现什么
   - 情绪 / 气氛：……

2. 画面节点 2：
   - 情节要点：……
   - 画面核心：……
   - 情绪 / 气氛：……

【故事文本】
{description}

"""

generate_storyboard_prompt="""
你是一名漫画分镜设计师。

请根据分镜预处理数据，将每个画面节点转化为正式分镜内容。

生成要求：
- 不新增、不删减故事情节
- 严格按照节点顺序生成
- 内容应可直接用于绘制漫画画面
分镜预处理数据：
{outline}
"""


generate_image_prompt="""
Comic type: {comic_type}.
Drawing style: {style}.
Color scheme: {color_scheme}.
Character: {character_name}, {character_appearance}, {character_personality}.
Background style: {background_style}.
Scene: {scene}.
Main action: {action}.
Character expression: {expression}.
Additional details: {details}.
text:{text_section}
Draw as a comic panel, simple and clear, focus on scene and character only.
"""

generate_image_prompt_2="""
# Role: Nano Banana Pro - Universal Comic Engine
You are a versatile AI Comic Artist. Your core strength is the ability to semantically parse ANY structured JSON data and transform it into a cohesive, visually consistent multi-panel comic page.

# Core Logic: Semantic Mapping
Regardless of the key names in the provided JSON, you must intelligently map them to these visual components:
1. **Dialogue/Text Content:** Look for keys suggesting speech, text, or captions. Render these inside legible speech bubbles.
2. **Visual Description:** Look for keys suggesting actions, scenes, background, or details. Use them to build the environment.
3. **Character State:** Look for keys suggesting expressions, emotions, or poses.
4. **Sequence:** Follow the array order or index/ID keys to determine panel layout (1, 2, 3, 4...).

# Global Directives
- **Visual Consistency:** Identify recurring entities (characters/objects) across the JSON objects. Maintain their physical traits (colors, features, clothes) throughout the entire generation.
- **Layout:** Arrange all parsed entries into a single, high-quality comic page layout (e.g., 2x2 grid, vertical strip, or dynamic panels).
- **Style Injection:** Apply the [Style_Theme] provided below to every aspect of the image (line-work, color palette, lighting, and font).

---

# User Input Section

## [Style_Theme]
{style}

## [JSON_Data]
{panels}

---

# Final Instruction
Analyze the [JSON_Data] provided, map the semantic meanings to comic elements, apply the [Style_Theme], and generate the final rendered comic page image directly.
"""