import logging
from fastapi import APIRouter, HTTPException
from app.services.team_advisor import recommend_balanced_kanto_team

router = APIRouter(prefix="/api/team", tags=["Team Advisor"])
logger = logging.getLogger("dexmind.routes.team")

@router.get("/advisor")
def get_team_recommendation():
    """Returns a deterministically calculated balanced Generation 1 team with RAG synergy explanation."""
    try:
        result = recommend_balanced_kanto_team()
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating team recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
