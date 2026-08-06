import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import routes
from scheduler import start_scheduler, shutdown_scheduler

logging.basicConfig(level=logging.INFO)

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Email Automation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's for local/internal dashboard demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1")

@app.on_event("startup")
async def on_startup():
    start_scheduler()
    
    # Pre-seed a default template for demo purposes if it doesn't exist
    from database import SessionLocal
    import models
    db = SessionLocal()
    default_templates = [
        models.Template(
            name="Welcome Back - VIP",
            subject="Exclusive {{ DiscountPercentage }} Off Just For You, {{ CustomerName }}!",
            html_content="<h1>Hi {{ CustomerName }}!</h1><p>Because you are in our <strong>{{ SegmentName }}</strong> group, we are offering you <strong>{{ DiscountPercentage }}</strong> off your next order.</p><p>As someone who has spent over ${{ TotalSpend }}, we value your business!</p>"
        ),
        models.Template(
            name="High Churn Retention Campaign",
            subject="{{ CustomerName }}, your {{ OfferValue }} retention reward is ready",
            html_content="""
            <div style="font-family: Helvetica, Arial, sans-serif; color: #101014; line-height: 1.5;">
              <h2 style="margin-bottom: 8px;">Hi {{ CustomerName }},</h2>
              <p>We noticed your recent activity has slowed down: <strong>{{ ChurnReason }}</strong>.</p>
              <p>{{ OfferHeadline }}</p>
              <div style="border: 1px solid #e7e7ea; border-radius: 8px; padding: 16px; margin: 18px 0;">
                <p style="margin: 0 0 6px; color: #595a64;">Your offer</p>
                <h3 style="margin: 0; color: #6B55D3;">{{ OfferValue }}</h3>
                <p style="margin: 8px 0 0;">{{ OfferDescription }}</p>
                <p style="margin: 12px 0 0;"><strong>Offer code:</strong> {{ OfferCode }}</p>
              </div>
              <p>
                <a href="{{ RedeemLink }}" style="background: #6B55D3; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; display: inline-block;">
                  Redeem offer
                </a>
              </p>
              <p style="margin-top: 16px;">Or scan this QR code:</p>
              <img src="{{ QRCodeImageUrl }}" alt="Retention offer QR code" width="160" height="160" style="border: 1px solid #e7e7ea; border-radius: 8px; padding: 8px;" />
              <p style="color: #595a64; font-size: 13px;">This offer expires in {{ ExpiryDays }} days.</p>
            </div>
            """
        ),
    ]

    for template in default_templates:
        exists = db.query(models.Template).filter(models.Template.name == template.name).first()
        if not exists:
            db.add(template)
    db.commit()
    db.close()

@app.on_event("shutdown")
async def on_shutdown():
    shutdown_scheduler()

@app.get("/health")
def health_check():
    return {"status": "ok"}
