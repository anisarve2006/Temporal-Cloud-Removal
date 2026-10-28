import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("BACKEND_PORT", 8001))
    print(f"Launching Cloudless AI Geospatial Processing Backend on http://127.0.0.1:{port} ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)

