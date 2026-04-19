from fastapi import FastAPI

app = FastAPI(title="TaskMesh API")

@app.get("/health")
async def health():
    return {"status": "ok"}
