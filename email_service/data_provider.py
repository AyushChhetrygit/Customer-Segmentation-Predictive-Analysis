import pandas as pd
import os
from typing import List, Dict
import hashlib
from urllib.parse import quote_plus

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "customer_processed.csv")
RETENTION_REDEEM_BASE_URL = os.getenv("RETENTION_REDEEM_BASE_URL", "https://demo.local/redeem")

def dedupe_customers(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty or "CustomerID" not in df.columns:
        return df

    sort_columns = [col for col in ["ProcessedAt", "GeneratedAt"] if col in df.columns]
    if sort_columns:
        df = df.sort_values(sort_columns)

    return df.drop_duplicates(subset=["CustomerID"], keep="last")

def get_clv_tier(row: pd.Series, low_threshold: float, high_threshold: float) -> str:
    clv = float(row.get("CLV", 0.0))

    if clv >= high_threshold:
        return "High"
    if clv >= low_threshold:
        return "Medium"
    return "Low"

def build_churn_reason(row: pd.Series) -> str:
    recency = int(row.get("Recency", 0))
    frequency = int(row.get("Frequency", row.get("TotalOrders", 0)))

    if recency >= 120:
        return f"No purchase in {recency} days"
    if recency >= 90:
        return f"Inactive for {recency} days"
    if frequency <= 3:
        return "Low repeat purchase frequency"
    return f"Elevated churn risk based on {recency} days since last purchase"

def build_retention_offer(row: pd.Series, low_threshold: float, high_threshold: float) -> Dict:
    customer_id = str(row.get("CustomerID", "UNKNOWN"))
    clv_tier = get_clv_tier(row, low_threshold, high_threshold)
    fingerprint = hashlib.sha1(f"{customer_id}:{row.get('CLV', 0)}:{row.get('Recency', 0)}".encode()).hexdigest()[:8].upper()
    offer_code = f"RET-{customer_id}-{fingerprint}"

    if clv_tier == "High":
        offer_type = "Cashback"
        offer_value = "₹500 cashback"
        offer_headline = "A cashback reward to welcome you back"
        offer_description = "Get ₹500 cashback after your next order above ₹2,499."
    elif clv_tier == "Medium":
        offer_type = "Discount QR"
        offer_value = "20% off"
        offer_headline = "Scan your personal discount QR"
        offer_description = "Use your QR code to unlock 20% off your next order."
    else:
        offer_type = "Reactivation Coupon"
        offer_value = "10% off"
        offer_headline = "A quick reactivation offer"
        offer_description = "Use this code for 10% off and restart your shopping journey."

    redeem_link = f"{RETENTION_REDEEM_BASE_URL}?code={quote_plus(offer_code)}&customer={quote_plus(customer_id)}"
    qr_code_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={quote_plus(redeem_link)}"

    return {
        "CLVTier": clv_tier,
        "OfferType": offer_type,
        "OfferCode": offer_code,
        "OfferValue": offer_value,
        "OfferHeadline": offer_headline,
        "OfferDescription": offer_description,
        "RedeemLink": redeem_link,
        "QRCodeImageUrl": qr_code_image_url,
        "ChurnReason": build_churn_reason(row),
        "ExpiryDays": 7,
    }

def get_customers_by_segment(segment_name: str) -> List[Dict]:
    """
    Reads the processed CSV and filters customers by segment logic.
    segment_name maps to different business rules:
      - 'VIP': Segment == 2 or CLV > 50000 or Recommendation == 'VIP Treatment'
      - 'At-Risk': ChurnRisk == 'High'
      - 'High-Churn-Retention': ChurnRisk == 'High' with personalized retention offers
      - 'Inactive': Recency > 90
      - 'New': AccountAgeMonths < 6
    """
    if not os.path.exists(CSV_PATH):
        return []

    df = pd.read_csv(CSV_PATH)
    df = dedupe_customers(df)

    if segment_name.lower() == "vip":
        filtered = df[(df['Segment'] == 2) | (df['CLV'] > 50000) | (df['RecommendedAction'] == 'VIP Treatment')]
    elif segment_name.lower() in ["at-risk", "atrisk", "high-churn-retention", "high_churn_retention"]:
        filtered = df[df['ChurnRisk'] == 'High']
    elif segment_name.lower() == "inactive":
        filtered = df[df['Recency'] > 90]
    elif segment_name.lower() == "new":
        filtered = df[df['AccountAgeMonths'] <= 6]
    else:
        filtered = df.head(0) # Empty match fallback

    filtered = filtered.sort_values(["CLV", "Recency"], ascending=[False, False]).head(500)

    if not filtered.empty:
        low_threshold = float(filtered["CLV"].quantile(0.40))
        high_threshold = float(filtered["CLV"].quantile(0.75))
    else:
        low_threshold = 0.0
        high_threshold = 0.0

    customers = []
    for _, row in filtered.iterrows():
        customer_id = row['CustomerID']
        
        # We synthesize an email and name since the dataset only contains CustomerID
        email_prefix = customer_id.lower().replace('c', 'customer')
        email = f"{email_prefix}@demo.local"
        name = f"User {customer_id}"

        attributes = {
            "Recency": int(row.get('Recency', 0)),
            "TotalSpend": float(row.get('TotalSpend', 0.0)),
            "CLV": float(row.get('CLV', 0.0)),
            "RecommendedAction": str(row.get('RecommendedAction', ''))
        }

        if segment_name.lower() in ["high-churn-retention", "high_churn_retention"]:
            attributes.update(build_retention_offer(row, low_threshold, high_threshold))

        customers.append({
            "customer_id": customer_id,
            "name": name,
            "email": email,
            "segment_name": segment_name.upper(),
            "churn_risk": str(row.get('ChurnRisk', 'Low')),
            "attributes": attributes
        })

    return customers

# For quick testing
if __name__ == "__main__":
    print(len(get_customers_by_segment("VIP")))
