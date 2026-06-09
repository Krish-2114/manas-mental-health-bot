from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models import User
from app.rag import query_rag
from app.schemas import RagQueryRequest, RagQueryResponse

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/query", response_model=RagQueryResponse)
def rag_query(
    body: RagQueryRequest,
    user: User = Depends(get_current_user),
):
    answer, sources = query_rag(body.question)
    return RagQueryResponse(answer=answer, sources=sources)
