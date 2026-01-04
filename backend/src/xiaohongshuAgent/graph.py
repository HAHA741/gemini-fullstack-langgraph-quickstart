import os
from typing import Any
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import START, END, StateGraph
from langchain_core.messages import AIMessage
import pysrt
from pathlib import Path
import contentAgent
import time
from xiaohongshuAgent.state import ContentState
from xiaohongshuAgent.prompts import (

    xiaohongshu_topic_prompt,
    xiaohongshu_article_prompt2,
    xiaohongshu_article_prompt
)
from xiaohongshuAgent.tools_and_schemas import TopicStruct
from contentAgent.utils_state import persistence

# 环境变量检查
if os.getenv("DeepSeek_API_KEY") is None:
    raise ValueError("DeepSeek_API_KEY 环境变量未设置")


def generate_topic(state:ContentState)->ContentState:
    """生成选题"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.85,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        structured_llm = llm.with_structured_output(TopicStruct)
        prompt = xiaohongshu_topic_prompt
        print("选题prompt = ",prompt)
        result = structured_llm.invoke(prompt)
        print("✓ 选题生成完成",str(result))
        # 假设返回的是多个标题，处理为列表
        topics = result.topics if hasattr(result, 'topics') else str(result)
        state["topics"] = topics
        state["messages"] = AIMessage(content=result.topics)
    except Exception as e:
        print(f"✗ 选题生成失败: {str(e)}")
    return state
def generate_article(state:ContentState)->ContentState:
    """根绝选题生成文章"""
    try:
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=0.85,
            api_key=os.getenv("DeepSeek_API_KEY")
        )
        print("开始生成文章：",str(state))
        # structured_llm = llm.with_structured_output(TopicStruct)
        prompt = xiaohongshu_article_prompt.format(topic=state["selected_topic"])
        print("文章prompt = ",prompt)
        result = llm.invoke(prompt)
        print("✓ 文章生成完成",result)
        state["article"] = result.content if hasattr(result, 'content') else str(result)
        state["messages"] = AIMessage(content=result.content)
    except Exception as e:
        print(f"✗ 文章生成失败: {str(e)}")
    return state
def save_conversation_state(state: ContentState) -> ContentState:
    """保存对话状态到文件"""
    try:
        # 使用 subtitle_text 的哈希值作为对话 ID
        import hashlib
        selected_topic = state.get("selected_topic", "")
        conversation_id = hashlib.md5(selected_topic.encode()).hexdigest()[:8]
        
        # 保存状态
        persistence.save_state(dict(state), conversation_id)
        print("✓ 对话状态已保存")
        state["saved_file_path"] = "saved"
    except Exception as e:
        print(f"✗ 保存对话状态失败: {str(e)}")
        state["warnings"] = (state.get("warnings", []) or []) + [f"保存状态出错: {str(e)}"]
    return state
def route_start(state: ContentState):
    """根据是否有 topic 决定起点"""
    if state.get("selected_topic"):
        return "generate_article"
    return "generate_topic"
def build_graph()->Any:
    builder = StateGraph(ContentState)
    # 添加节点
    builder.add_node("generate_topic", generate_topic)
    builder.add_node("generate_article", generate_article)
    builder.add_node("save_conversation_state", save_conversation_state)

    # --- 修改后的边定义 ---

    # 逻辑 A: 从 START 开始进行条件判断
    builder.add_conditional_edges(
        START,
        route_start,
        {
            "generate_article": "generate_article",
            "generate_topic": "generate_topic"
        }
    )

    # 逻辑 B: generate_topic 生成建议后，指向 generate_article
    builder.add_edge("generate_topic", "generate_article")
    builder.add_edge("generate_article", "save_conversation_state")
    builder.add_edge("save_conversation_state", END)

    return builder.compile(name="pro-xiaohongshu-content",interrupt_after=["generate_topic"])
# 编译图
graph = build_graph()