from typing import TypedDict, List, Optional

class Viewpoint(TypedDict):
    content: str
    type: str            # 结论 / 论据 / 举例 / 推测
    relation: str        # 并列 / 因果 / 递进 / 对比
    source: str          # 作者 / 提问者 / 其他

class OverallState(TypedDict):
    subtitle_text: str                  # 原始字幕
    core_topic: Optional[str]            # 核心主题
    viewpoints: Optional[List[Viewpoint]]# 阶段一输出
    article: Optional[str]               # 阶段二输出
    titles: Optional[List[str]]          # 阶段三输出
    warnings: Optional[List[str]]        # 不确定 / 冲突标记