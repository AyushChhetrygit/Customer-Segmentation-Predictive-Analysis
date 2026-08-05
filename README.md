# Customer Segmentation and Predictive Analytics Platform

An end-to-end customer intelligence platform built to help small businesses evaluate their customer base, identify churn risk, understand customer value, and take targeted marketing actions from a single dashboard.

This project combines a Python machine learning pipeline, a Node.js analytics API, a FastAPI email campaign service, and a React dashboard. It is designed as an interview-ready full-stack data science project that demonstrates practical machine learning, business analytics, backend API development, and modern frontend engineering.

## Project Goal

Small businesses often collect customer, purchase, and engagement data but do not have the tools to turn that data into decisions. This platform aims to solve that problem by helping businesses:

- Segment customers based on purchasing behavior.
- Identify customers with high churn risk.
- Estimate customer lifetime value.
- Recommend the next best marketing action.
- Track revenue, engagement, and retention metrics.
- Run targeted email campaigns for customer retention and reactivation.

Instead of treating every customer the same, the platform gives businesses a way to focus on the right customer group with the right action.

## Key Features

- Customer segmentation using RFM-style features and K-Means clustering.
- Churn risk classification based on recency and purchase frequency.
- Customer Lifetime Value scoring using spend and frequency signals.
- Recommended action engine for retention, loyalty, VIP, and regular engagement campaigns.
- Interactive dashboard for KPIs, segments, churn, CLV distribution, trends, and action analysis.
- Customer table with search, sorting, pagination, and filtering.
- Email campaign service with templates, scheduled campaigns, audience previews, and send logs.
- Synthetic customer data generator for repeatable demos and testing.
- Optional AWS S3 upload utility for batch or cloud-oriented data workflows.

## Business Use Case

The platform is built around a small business scenario:

1. A business imports or generates customer purchase data.
2. The ML pipeline calculates behavioral features such as recency, frequency, monetary value, engagement score, churn risk, and CLV.
3. Customers are grouped into actionable segments.
4. The dashboard shows which customers are valuable, inactive, loyal, or at risk.
5. The campaign engine helps create targeted actions such as retention offers, loyalty rewards, reactivation emails, and VIP treatment.

Example decisions supported by the platform:

- Send retention offers to high-risk customers.
- Reward high-value customers with loyalty campaigns.
- Reactivate dormant customers with personalized emails.
- Prioritize marketing budget toward customers with higher projected value.

## Tech Stack

### Machine Learning and Data Processing

- Python
- Pandas
- NumPy
- Scikit-learn
- K-Means clustering
- Feature engineering with RFM, engagement, churn, and CLV signals

### Backend

- Node.js
- Express.js
- CSV parsing and file watching
- REST API endpoints for dashboard analytics

### Email Campaign Service

- FastAPI
- SQLAlchemy
- Pydantic
- APScheduler
- Gmail API integration support

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React
- jsPDF and html2canvas for report export support

### Data and Cloud Utilities

- Synthetic data generation
- Processed CSV analytics dataset
- Optional AWS S3 upload workflow

## System Architecture

```text
Synthetic / Customer Data
          |
          v
Python ML Pipeline
Feature Engineering + Segmentation + Churn Risk + CLV + Recommended Actions
          |
          v
data/processed/customer_processed.csv
          |
          v
Node.js Express Analytics API  --->  React Dashboard
          |
          v
Business Insights, Customer Tables, Charts, Filters, Reports

FastAPI Email Service
Templates + Campaigns + Scheduling + Gmail Integration + Send Logs
```

## Project Structure

```text
.
|-- client/                       # React frontend dashboard
|   |-- src/
|   |   |-- components/           # Charts, cards, layout, tables, reports
|   |   |-- pages/                # Dashboard, segmentation, churn, CLV, campaigns
|   |   |-- context/              # Theme and filter state
|   |   |-- hooks/                # API and auto-refresh hooks
|   |   `-- utils/                # API helpers and PDF export
|   `-- package.json
|-- server/                       # Node.js analytics API
|   |-- routes/                   # Dashboard API routes
|   |-- utils/                    # CSV parsing and data loading
|   `-- package.json
|-- email_service/                # FastAPI campaign automation service
|   |-- routes.py                 # Templates, campaigns, logs, segment preview
|   |-- scheduler.py              # Scheduled campaign execution
|   |-- gmail_api.py              # Gmail integration support
|   |-- models.py                 # Database models
|   `-- requirements.txt
|-- data/
|   `-- processed/                # Processed customer analytics dataset
|-- synthetic_data_generator.py   # Synthetic customer data generator
|-- ml_pipeline.py                # Feature engineering and ML pipeline
|-- s3_upload.py                  # Optional AWS S3 upload utility
|-- config.py                     # Cloud/config settings
|-- run_commands.txt              # Detailed local run instructions
`-- README.md
```

## Machine Learning Workflow

### 1. Data Preparation

The project uses customer behavior and transaction fields such as:

- Customer ID
- Account age
- Last purchase days
- Total orders
- Total spend
- Average order value
- App logins
- Wishlist items
- Cart abandonments
- Discount usage

### 2. Feature Engineering

The ML pipeline creates business-friendly features:

- Recency: how recently the customer purchased.
- Frequency: how often the customer orders.
- Monetary: total customer spend.
- Engagement Score: weighted score based on app logins, wishlist activity, and cart behavior.

### 3. Customer Segmentation

Customers are grouped using K-Means clustering on RFM features. These segments allow a business to understand customer groups by behavior instead of guessing manually.

### 4. Churn Risk

The pipeline assigns churn risk levels using customer activity patterns:

- High risk: inactive and low-frequency customers.
- Medium risk: customers with moderate inactivity.
- Low risk: recently active customers.

### 5. Customer Lifetime Value

CLV is calculated from monetary and frequency signals to estimate the relative future value of each customer.

### 6. Recommended Actions

The decision engine maps customer analytics into practical marketing actions:

- Retention Campaign
- Loyalty Program
- VIP Treatment
- Regular Engagement

## Dashboard Modules

- Dashboard: overall KPIs, revenue, engagement, churn, and high-value customer counts.
- Segmentation: customer segment distribution and cluster visualization.
- Churn Analytics: churn risk breakdown and retention focus areas.
- CLV Insights: customer lifetime value distribution and high-value customer analysis.
- Action Matrix: recommended action analysis by segment and churn risk.
- Customer Table: searchable and filterable customer-level records.
- Campaign Manager: campaign templates, segment previews, scheduling, and email logs.
- Settings: application-level controls and preferences.

## API Capabilities

The Node.js analytics API serves processed customer data to the dashboard, including:

- Customer list with filters, search, pagination, and sorting.
- Segment distribution.
- Churn risk distribution.
- CLV distribution.
- Recommended action summary and action matrix.
- KPI aggregation.
- Scatter plot and trend data.

The FastAPI campaign service supports:

- Email template creation and retrieval.
- Campaign creation and scheduling.
- Manual campaign triggering.
- Campaign email logs.
- Segment audience previews.

## Getting Started

### 1. Run the Python ML Pipeline

```bash
python3 -m venv venv
source venv/bin/activate
pip install pandas numpy scikit-learn boto3 jupyter

python synthetic_data_generator.py
python ml_pipeline.py
```

This creates or updates:

```text
data/processed/customer_processed.csv
```

### 2. Start the Node.js Analytics API

```bash
cd server
npm install
npm run dev
```

The analytics API runs on:

```text
http://localhost:5000
```

### 3. Start the React Dashboard

```bash
cd client
npm install
npm run dev
```

The dashboard runs on:

```text
http://localhost:5173
```

### 4. Optional: Start the Email Campaign Service

```bash
cd email_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Interview Highlights

This project is useful to discuss in interviews because it shows:

- End-to-end product thinking from business problem to dashboard.
- Data preprocessing and feature engineering for customer analytics.
- Practical machine learning through segmentation, churn scoring, and CLV estimation.
- Full-stack development with React, Node.js, and FastAPI.
- REST API design for analytics consumption.
- Marketing automation workflow design.
- A clear small-business use case with measurable business impact.
- Separation of concerns across ML pipeline, analytics API, dashboard, and email service.

## Future Improvements

- Add SHAP explanations for churn and CLV drivers.
- Replace rule-based churn scoring with trained classification models.
- Add BG/NBD and Gamma-Gamma CLV modeling.
- Add PostgreSQL persistence for production customer records.
- Add authentication and role-based access control.
- Add campaign performance metrics such as opens, clicks, and conversions.
- Deploy the dashboard and APIs using Docker and cloud infrastructure.
- Add real-time data ingestion with Kafka or streaming jobs.

## Summary

The Customer Segmentation and Predictive Analytics Platform helps small businesses move from raw customer data to actionable retention and revenue strategies. It evaluates the customer base, highlights churn risk, estimates customer value, and recommends marketing actions that can improve retention and customer engagement.
