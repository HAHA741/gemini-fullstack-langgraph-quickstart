import os
from typing import Any
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import AIMessage
from contentAgent.utils_state import persistence

from comicsAgent.state import (OverallState,PanelInfo)
from comicsAgent.prompts import (
    generate_outline_prompt,
    generate_storyboard_prompt,
    generate_image_prompt,
    generate_image_prompt_2
)
from langchain_openai import ChatOpenAI

from comicsAgent.tools_and_schemas import StoryboardResult
from comicsAgent.gemini import save_response_and_images


# 环境变量检查
if os.getenv("DeepSeek_API_KEY") is None:
    raise ValueError("DeepSeek_API_KEY 环境变量未设置")
if os.getenv("YUNWU_BASE_URL") is None:
    raise ValueError("YUNWU_BASE_URL 环境变量未设置")
if os.getenv("YUNWU_API_KEY") is None:
    raise ValueError("YUNWU_API_KEY 环境变量未设置")
def generate_outline(state: OverallState)->OverallState:
    """生成预分镜处理"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.7,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = generate_outline_prompt.format(description=state["description"])
        print("预分镜prompt = ",prompt)
        result = llm.invoke(prompt)
        state["outline"] = result.content
        print("预分镜结果",result)

        state["messages"] = AIMessage(content=result.content)

    except Exception as e:
        print(f"✗ 预分镜处理失败: {str(e)}")
        return state
    return state

def generate_storyboard(state: OverallState)->OverallState:
    """生成分镜处理"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = generate_storyboard_prompt.format(outline=state["outline"])
        print("分镜prompt = ",prompt)
        structured_llm = llm.with_structured_output(StoryboardResult)
        result = structured_llm.invoke(prompt)
        print("分镜结果",result)
        if not hasattr(result, "panels") or not result.panels:
            raise ValueError("StoryboardResult 中未返回有效 panels")
        storyBoard = result.panels
        state["storyBoard"] = storyBoard
        state["messages"] = AIMessage(content=str(result))

    except Exception as e:
        print(f"✗ 分镜处理失败: {str(e)}")
        return state
    return state

def generate_image_call(panel: PanelInfo, state: OverallState) -> str:
    """生成单张图片处理（字段缺失默认空串）"""
    try:
        # llm = ChatOpenAI(
        #     model="gemini-3-pro-image-preview",
        #     base_url=os.getenv("YUNWU_BASE_URL"),
        #     api_key=os.getenv("YUNWU_API_KEY")
        # )

        comic = state.get("comicInfo", {})
        character = comic.get("character", {})

        prompt = generate_image_prompt.format(
            comic_type=comic.get("type", ""),
            style=comic.get("style", ""),
            color_scheme=comic.get("color_scheme", ""),
            background_style=comic.get("background_style", ""),

            character_name=character.get("name", ""),
            character_appearance=character.get("appearance", ""),
            character_personality=character.get("personality", ""),

            scene=panel.scene or "",
            action=panel.action or "",
            expression=panel.expression or "",
            details=panel.details or "",
            text_section=panel.text or ""
        )
        

        print("图片生成prompt =", prompt)
        result = save_response_and_images(prompt,"outputs/comics")

        # result = llm.invoke(prompt)
        print("图片生成结果",result)
        return result["images"]

    except Exception as e:
        print(f"✗ 图片处理失败: {e}")
        return ""


def generate_comics(storyboard)->str:
    try: 
        prompt = generate_image_prompt_2.format(panels=storyboard,style="Q版可爱，全彩高亮")
        print("图片生成prompt =", prompt)
        result = save_response_and_images(prompt,"outputs/comics")
        return result["images"]
    except Exception as e:
        print(f"✗ 漫画处理失败: {str(e)}")
        return ""



def batch_generate_image(state: OverallState) -> OverallState:
    """批量生成图片处理"""
    print("--- 正在批量生成图片 ---")
    try:
        current_images = state.get("images", []) or []
        storyboard = state.get("storyBoard", [])
        print("分镜数据",storyboard)
        
        if not storyboard:
            print("没有分镜数据，跳过绘图")
            return {}

        # new_images = []
        new_images = generate_comics(storyboard)

        # for i, panel in enumerate(storyboard):
            # print(f"正在生成第 {i+1} 张图片...")
            # if(i>10):
            #     return state
            # print("单张图片数据 ",panel)
            # img_result = generate_image_call(panel,state)
            # new_images.append(img_result)
        state["images"] = current_images + new_images
        state["messages"] = AIMessage(content=str(state["images"]))
        # 修正：必须返回包含新 images 的字典来更新状态
        return state
    
    except Exception as e:
        print(f"✗ 批量绘图失败: {str(e)}")
        return {"warnings": [f"绘图出错: {str(e)}"]}
    
def save_conversation_state(state: OverallState) -> OverallState:
    """保存对话状态到文件"""
    try:
        # 使用 subtitle_text 的哈希值作为对话 ID
        import hashlib
        description = state.get("description", "")
        conversation_id = hashlib.md5(description.encode()).hexdigest()[:8]
        
        # 保存状态
        persistence.save_state(dict(state), conversation_id,"outputs/comics")
        print("✓ 对话状态已保存")
        state["saved_file_path"] = "saved"
    except Exception as e:
        print(f"✗ 保存对话状态失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"保存状态出错: {str(e)}"]
    return state


def build_graph()->Any:
    """构建图"""
    graph = StateGraph(OverallState)
    # graph.add_node(START, generate_outline)
    graph.add_node("generate_outline", generate_outline)
    graph.add_node("generate_storyboard", generate_storyboard)
    graph.add_node("batch_generate_image", batch_generate_image)
    graph.add_node("save_conversation_state",save_conversation_state)
    # graph.add_node(END, persistence)
    graph.add_edge(START, "generate_outline")
    graph.add_edge("generate_outline", "generate_storyboard")
    graph.add_edge("generate_storyboard", "batch_generate_image")
    graph.add_edge("batch_generate_image", "save_conversation_state")
    graph.add_edge("save_conversation_state", END)

    return graph.compile(name="pro-comics-agent")

graph = build_graph()
