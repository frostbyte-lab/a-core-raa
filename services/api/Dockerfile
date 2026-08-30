FROM python:3.12-slim
WORKDIR /app
COPY services/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY services/api/main.py ./main.py
COPY internet-shard-manifest.json /app/internet-shard-manifest.json
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
