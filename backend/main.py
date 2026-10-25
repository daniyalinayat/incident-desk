from fastapi import FastAPI

app = FastAPI(title="Incident Desk API")


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
