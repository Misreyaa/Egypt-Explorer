from fastapi import APIRouter, HTTPException
from ..models import Post, Comment
from ..db import posts_collection

router = APIRouter()

@router.post("/")
async def add_post(post: Post):
    result = await posts_collection.insert_one(post.dict())
    return {"id": str(result.inserted_id)}

@router.get("/")
async def get_posts():
    posts = []
    async for p in posts_collection.find():
        p["_id"] = str(p["_id"])
        posts.append(p)
    return posts

@router.get("/{post_id}")
async def get_post(post_id: str):
    p = await posts_collection.find_one({"post_id": post_id})
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    p["_id"] = str(p["_id"])
    return p

@router.post("/{post_id}/comment")
async def add_comment(post_id: str, comment: Comment):
    result = await posts_collection.update_one(
        {"post_id": post_id},
        {"$push": {"comments": comment.dict()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"added_comment": True}
