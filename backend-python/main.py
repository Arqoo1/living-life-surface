from fastapi import FastAPI
from routes import rule_engine

app = FastAPI(title="Life Surface Rule Engine")

app.include_router(rule_engine.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Python rule engine alive"}
