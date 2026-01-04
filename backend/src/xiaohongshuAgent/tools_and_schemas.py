from typing import (List,Optional,Literal)
from pydantic import BaseModel, Field



class TopicStruct(BaseModel):
    topics: List[str] = Field(
        default=[],
        description="主题列表"
    )