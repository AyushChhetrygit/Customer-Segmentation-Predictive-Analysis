# Customer Segmentation and Predictive Analytics Platform

A customer intelligence dashboard for small businesses to understand customer behavior, identify churn risk, estimate customer value, and run targeted retention campaigns.

The project combines a Python ML pipeline, an Express analytics API, a FastAPI email automation service, and a React dashboard.

## Highlights

- RFM-style customer segmentation with K-Means.
- Churn risk scoring and customer lifetime value estimates.
- Deduplicated customer records by `CustomerID`.
- Interactive dashboards for KPIs, segments, churn, CLV, and recommended actions.
- High-churn retention automation with fake demo emails, unique offer codes, QR discount links, cashback offers, and campaign logs.
- Gmail API support with simulation mode when credentials are unavailable.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Analytics API: Node.js, Express, CSV parser
- Email Automation: FastAPI, SQLAlchemy, APScheduler, Jinja2, Gmail API
- Data/ML: Python, Pandas, NumPy, Scikit-learn

## Architecture

```text
scripts/synthetic_data_generator.py
            |
            v
scripts/ml_pipeline.py
            |
            v
data/processed/customer_processed.csv
            |
            +--> Express API --> React Dashboard
            |
            +--> FastAPI Email Service --> Retention Campaign Logs
```

## Project Structure

```text
client/          React dashboard
server/          Express analytics API
email_service/   FastAPI campaign automation service
scripts/         Data generation, ML pipeline, optional S3 upload
data/processed/  Sample processed customer dataset
```

## Run Locally

### 1. Generate or refresh processed customer data

```bash
python3 -m venv venv
source venv/bin/activate
pip install pandas numpy scikit-learn boto3 jupyter

python scripts/synthetic_data_generator.py
python scripts/ml_pipeline.py
```

### 2. Start the analytics API

```bash
cd server
npm install
npm run dev
```

Default API URL:

```text
http://localhost:5001
```

### 3. Start the dashboard

```bash
cd client
npm install
npm run dev
```

Dashboard:

```text
http://localhost:5173
```

### 4. Optional: start email automation

```bash
cd email_service
../venv/bin/pip install -r requirements.txt
../venv/bin/uvicorn main:app --reload --port 8000
```

Email API:

```text
http://localhost:8000
```

## Retention Campaign Demo

Open the dashboard and go to **Email Campaigns**.

The `High Churn Retention` campaign:

- selects customers where `ChurnRisk == "High"`;
- creates fake emails such as `customer00515@demo.local`;
- generates unique retention offer codes;
- assigns offers by CLV tier:
  - High CLV: cashback
  - Medium CLV: discount QR
  - Low CLV: reactivation coupon
- renders redeem links and QR codes;
- stores send logs after Gmail send or simulation mode.

## Verification

```bash
cd client && npm run build
cd ../server && node -c index.js
cd ../email_service && python3 -m py_compile *.py
```


## Future Improvements

- SHAP explanations for churn and CLV drivers.
- Trained churn classifier instead of rule-based scoring.
- BG/NBD and Gamma-Gamma CLV models.
- Campaign redemption tracking and performance analytics.
- Authentication, PostgreSQL, Docker, and cloud deployment.
