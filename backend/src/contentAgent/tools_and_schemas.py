from typing import List
from pydantic import BaseModel, Field

class ViewPointStruct(BaseModel):
    content: str = Field(
        description="观点的具体内容和表述"
    )
    type: str = Field(
        description="观点分类：结论(最终结论) / 论据(支持证据) / 举例(具体案例) / 推测(推理推断)"
        )
    relation: str = Field(
        description="与前一观点的逻辑关系：并列(同级) / 因果(因果关系) / 递进(递进深化) / 对比(对立对比)"
    )
    source: str = Field(
        description="观点来源、参考文献或数据出处"
    )
class ViewPointsStruct(BaseModel):
    viewpoints: List[ViewPointStruct] = Field(
        description="按逻辑关系组织的观点集合，每个观点包含内容、类型、关系和来源"
    )