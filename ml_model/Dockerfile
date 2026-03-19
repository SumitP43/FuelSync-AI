FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train the model on startup
RUN python train.py

EXPOSE 5001

CMD ["python", "app.py"]
