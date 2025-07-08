import streamlit as st
import pandas as pd

# Regional reach mock data
REGIONAL_REACH = {
    "UK": 500000,
    "US": 1000000,
    "EU": 750000,
    "APAC": 300000,
}

# Tier conversion rates
TIER_MULTIPLIERS = {
    "1": 0.10,
    "2": 0.05,
    "3": 0.02,
}

st.title("Forecasting GPT")

st.markdown("Use this tool to forecast ROAS for retailer campaigns.")

retailer = st.text_input("Retailer Name")
tier = st.selectbox("Retailer Tier", options=["1", "2", "3"])
aov = st.number_input("Average Order Value (£)", min_value=0.0)
region = st.selectbox("Region", options=list(REGIONAL_REACH.keys()))
cashback_pct = st.slider("Cashback Percentage (%)", 0, 100, 10)

if st.button("Generate Forecast"):
    reach = REGIONAL_REACH.get(region, 0)
    conversion_rate = TIER_MULTIPLIERS.get(tier, 0.0)
    expected_sales = reach * conversion_rate
    expected_revenue = expected_sales * aov
    cashback_cost = expected_revenue * (cashback_pct / 100)
    roas = expected_revenue / cashback_cost if cashback_cost else 0

    st.markdown("### Forecast Results")
    st.write(f"**Expected Sales:** {expected_sales:,.0f}")
    st.write(f"**Expected Revenue:** £{expected_revenue:,.2f}")
    st.write(f"**Cashback Cost:** £{cashback_cost:,.2f}")
    st.write(f"**ROAS:** {roas:.2f}x")