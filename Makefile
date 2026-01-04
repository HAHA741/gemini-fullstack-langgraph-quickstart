.PHONY: help dev-frontend dev-backend dev



VENV := .venv
PYTHON := $(VENV)\Scripts\python.exe
LANGGRAPH := $(VENV)\Scripts\langgraph.exe

help:
	@echo "Available commands:"
	@echo "  make dev-frontend    - Start Vite frontend"
	@echo "  make dev-backend     - Start LangGraph backend (venv)"
	@echo "  make dev             - Start frontend + backend"

dev-frontend:
	@cd frontend && npm run dev

dev-api:
	@echo Starting FastAPI (uvicorn)...
	cd backend && "$(PYTHON)" -m uvicorn agent.app:app --app-dir src --reload

dev-langgraph:
	@echo Starting LangGraph dev server...
	cd backend && "$(LANGGRAPH)" dev

dev-backend:
	@echo Starting all backend services...
	@make dev-langgraph & make dev-api

dev:
	@echo "Starting frontend and backend..."
	@make dev-frontend & \
	make dev-backend & \
	wait
