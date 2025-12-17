from pydantic import BaseModel, Field
from typing import List, Optional


class ExcelOverview(BaseModel):
    title: str = Field(
        description="Overall title or主题 of the Excel data"
    )
    description: str = Field(
        description="High-level summary of what this Excel dataset represents"
    )
    time_range: Optional[str] = Field(
        description="Time range covered by the data, if applicable"
    )
    row_count: int = Field(
        description="Total number of rows in the Excel table"
    )
    column_count: int = Field(
        description="Total number of columns in the Excel table"
    )
class KeyMetric(BaseModel):
    name: str = Field(
        description="Name of the key metric (e.g. 总销售额, 转化率)"
    )
    column: str = Field(
        description="Column name in Excel that this metric is derived from"
    )
    value: Optional[str] = Field(
        description="Aggregated or representative value of the metric"
    )
    unit: Optional[str] = Field(
        description="Unit of the metric (e.g. %, 元, 次)"
    )
    trend: Optional[str] = Field(
        description="Trend of the metric (up, down, stable, fluctuating)"
    )
class MetricAnalysis(BaseModel):
    metric_name: str = Field(
        description="Name of the metric being analyzed"
    )
    insight: str = Field(
        description="Key insight discovered from the metric"
    )
    possible_reason: Optional[str] = Field(
        description="Possible reasons behind the observed trend or value"
    )
    risk_or_opportunity: Optional[str] = Field(
        description="Potential risk or opportunity indicated by this metric"
    )
class ExcelAnalysisResult(BaseModel):
    overview: ExcelOverview = Field(
        description="High-level overview of the Excel dataset"
    )
    key_metrics: List[KeyMetric] = Field(
        description="List of key metrics extracted from the Excel data"
    )
    metric_analyses: List[MetricAnalysis] = Field(
        description="Detailed analysis for each key metric"
    )
    conclusion: Optional[str] = Field(
        description="Overall conclusion or summary of findings"
    )
    suggestions: Optional[List[str]] = Field(
        description="Actionable suggestions based on the analysis"
    )
