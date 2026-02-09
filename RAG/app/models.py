from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str
    wheelchair_only: bool = False


class QueryResponse(BaseModel):
    response: str
    sources: list


class IngestionResponse(BaseModel):
    status: str
    documents_processed: int
    collection_name: str
    message: str
