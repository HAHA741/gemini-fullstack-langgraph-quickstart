from dotenv import load_dotenv
load_dotenv()
import os
from langchain_deepseek import ChatDeepSeek
from excelAgent.tools_and_schemas import ExcelAnalysisResult
from excelAgent.state import AnalysisState
from agent.state import (
    OverallState,
    QueryGenerationState,
    ReflectionState,
    WebSearchState,
)
from langgraph.graph import START, END
from langgraph.graph import StateGraph
import excelAgent
from pathlib import Path
import pandas as pd
if os.getenv("DeepSeek_API_KEY") is None:
    raise ValueError("DeepSeek_API_KEY is not set")

# 节点 excel解析

def parse_excel(state: dict) -> dict:
    print(state, "state")

    BASE_DIR = Path(excelAgent.__file__).resolve().parent
    excel_path = BASE_DIR / "data" / "demo.xlsx"

    df = pd.read_excel(excel_path)

    state["table_text"] = df.to_markdown(index=False)
    state["parsed_data"] = df

    # print("Excel parsed:", state["table_text"], state["parsed_data"])
    return state
#AI数据结构解析
def ai_analyze(state:AnalysisState)->AnalysisState:
    print("第二步",state)
    llm = ChatDeepSeek(
        model="deepseek-chat",
        temperature=0
    )
    prompt = f"""
你是一名专业的数据分析助手。

下面是一份从 Excel 表格中提取的数据内容，请你【仅基于提供的数据】进行分析，
不得引入任何表格之外的常识或假设。

请按照指定结构返回分析结果。

分析要求：
1. 给出表格的整体概览（用途、范围、规模）
2. 识别 2~5 个最有业务意义的关键指标
3. 对每个关键指标给出明确的分析结论
4. 不要重复表格原始数据
5. 所有结论都必须可以从表格数据中推导

数据内容如下：
--------------------
{state["table_text"]}
--------------------
"""
    structured_llm = llm.with_structured_output(ExcelAnalysisResult)
    result = structured_llm.invoke(prompt)
    print(result)
    state["ai_analysis_result"] = result
    return state


builder =StateGraph(AnalysisState)

builder.add_node("parse_excel",parse_excel)
builder.add_node("ai_analyze",ai_analyze)

builder.add_edge(START,"parse_excel")
builder.add_edge("parse_excel","ai_analyze")
builder.add_edge("ai_analyze",END)

graph = builder.compile(name="pro-research-excel")