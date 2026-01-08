import os
from typing import Any
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import AIMessage
import pysrt
from pathlib import Path
import contentAgent
import time
from contentAgent.state import OverallState
from contentAgent.prompts import (
    opinion_extraction_prompt,
    article_generation_prompt,
    title_generation_prompt,
    story_article_writer,
    title_generation_prompt2,
    knowledge_article_writer,
    review_article_prompt,
    comment_generation_prompt
)
from contentAgent.tools_and_schemas import ViewPointsStruct
from contentAgent.utils_state import persistence

# 环境变量检查
if os.getenv("DeepSeek_API_KEY") is None:
    raise ValueError("DeepSeek_API_KEY 环境变量未设置")

def parse_srt(path:str)->str:
    """解析 SRT 字幕文件，返回纯文本内容"""
    subtitles = pysrt.open(path, encoding='utf-8')
    texts = [sub.text.replace('\n', ' ') for sub in subtitles]
    return ' '.join(texts)
def analyze_subtitle(state: OverallState) -> OverallState:
    """分析字幕/文本，提取观点结构"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0,
            timeout=600,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        BASE_DIR = Path(contentAgent.__file__).resolve().parent
        srt_path = BASE_DIR / "data" / str(state["srt"])
        subtitle_text = parse_srt(srt_path)
        state["subtitle_text"] = subtitle_text

        structured_llm = llm.with_structured_output(ViewPointsStruct)
        prompt = opinion_extraction_prompt.format(transcript=subtitle_text)
        print("观点prompt = ",prompt)
        print("start", time.time())
        # result = structured_llm.invoke(prompt)
        result = llm.invoke(prompt)
        print("end", time.time())
        print("✓ 观点分析完成",result)
        state["viewpoints"] = result.content if hasattr(result, 'content') else str(result)
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 观点分析失败: {str(e)}")
        # print(result)
        state["viewpoints"] = result
        state["warnings"] = [f"观点分析出错: {str(e)}"]
        raise RuntimeError("viewpoints is missing, abort graph")
    return state
def generate_article(state: OverallState) -> OverallState:
    """根据观点生成文章"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.85,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = knowledge_article_writer.format(viewpoints=state.get("viewpoints", []))
        print("文章prompt = ",prompt)
        result = llm.invoke(prompt)
        print("✓ 文章生成完成")
        state["article"] = result.content if hasattr(result, 'content') else str(result)
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 文章生成失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"文章生成出错: {str(e)}"]
    return state
def generate_title(state: OverallState) -> OverallState:
    """根据文章生成标题"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.85,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = title_generation_prompt2.format(article=state.get("article", ""))
        print("标题prompt = ",prompt)
        result = llm.invoke(prompt)
        print("✓ 标题生成完成")
        # 假设返回的是多个标题，处理为列表
        titles_text = result.content if hasattr(result, 'content') else str(result)
        state["titles"] = [t.strip() for t in titles_text.split('\n') if t.strip()]
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 标题生成失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"标题生成出错: {str(e)}"]
    return state
def review_article(state:OverallState)->OverallState:
    """对文章进行审核"""
    try:
        llm=ChatDeepSeek(
            model="deepseek-chat",
            temperature = 0,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = review_article_prompt.format(article=state.get("article", ""))
        print("审核prompt = ",prompt)
        result = llm.invoke(prompt)
        print("✓ 文章审核完成")
        state["review_result"] = result.content if hasattr(result, 'content') else str(result)
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 文章审核失败: {str(e)}")
    return state
def generate_comment(state: OverallState)-> OverallState:
    """生成评论"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=1,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        prompt = comment_generation_prompt.format(article=state.get("article", ""))
        print("评论prompt = ",prompt)
        result = llm.invoke(prompt)
        print("✓ 评论生成完成")
    
        state["comment"] = result.content if hasattr(result, 'content') else str(result)
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 评论生成失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"评论生成出错: {str(e)}"]
    return state
def save_conversation_state(state: OverallState) -> OverallState:
    """保存对话状态到文件"""
    try:
        # 使用 subtitle_text 的哈希值作为对话 ID
        import hashlib
        subtitle = state.get("subtitle_text", "")
        conversation_id = hashlib.md5(subtitle.encode()).hexdigest()[:8]
        
        # 保存状态
        persistence.save_state(dict(state), conversation_id,"outputs/content")
        print("✓ 对话状态已保存")
        state["saved_file_path"] = "saved"
    except Exception as e:
        print(f"✗ 保存对话状态失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"保存状态出错: {str(e)}"]
    return state
# 构建工作流图
def build_graph() -> Any:
    """构建内容生成工作流图"""
    builder = StateGraph(OverallState)

    # 添加节点
    builder.add_node("analyze_subtitle", analyze_subtitle)
    builder.add_node("generate_article", generate_article)
    builder.add_node("generate_title", generate_title)
    builder.add_node("save_state", save_conversation_state)
    builder.add_node("review_article", review_article)
    builder.add_node("generate_comment", generate_comment)

    # 添加边（定义流程）
    builder.add_edge(START, "analyze_subtitle")
    builder.add_edge("analyze_subtitle", "generate_article")
    builder.add_edge("generate_article", "review_article")
    builder.add_edge("review_article", "generate_title")
    builder.add_edge("generate_title", "generate_comment")
    builder.add_edge("generate_comment", "save_state")
    builder.add_edge("save_state", END)

    return builder.compile(name="pro-knowledge-content")


# 编译图
graph = build_graph()