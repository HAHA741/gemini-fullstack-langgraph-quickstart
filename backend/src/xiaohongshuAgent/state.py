from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import add_messages

class ContentState(TypedDict):
    topics: list[str]          # 候选选题
    selected_topic: str | None # 人选中的选题
    article: str | None        # 正文
    titles: list[str] | None   # 标题候选
    messages: Annotated[list, add_messages]  # 消息历史


class OverallState(TypedDict):

    subtitle_text: str                   # 原始内容
    core_topic: Optional[str]            # 核心主题
    viewpoints: any                      # 知识点输出
    article: Optional[str]               # 文章输出
    titles: Optional[List[str]]          # 标题输出
    warnings: Optional[List[str]]        # 不确定 / 冲突标记
    review_result:str                    # 审核结果
    comment:str                          # 评论
    srt:str                              # 原始文件
    effort:str                           # 解析方式