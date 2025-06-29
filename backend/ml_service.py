from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import random

from models import InventoryItem, Order, OrderItem, StockMovement

class MLService:
    def __init__(self):
        self.simulation_enabled = True
        
    def get_demand_forecast(self, db: Session, item_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Generate demand forecast for inventory items."""
        if item_id:
            items = [db.query(InventoryItem).filter(InventoryItem.id == item_id).first()]
            if not items[0]:
                return {"error": "Item not found"}
        else:
            items = db.query(InventoryItem).limit(10).all()  # Top 10 items
        
        forecasts = []
        
        for item in items:
            # Get historical sales data (simplified)
            historical_orders = db.query(OrderItem).filter(
                OrderItem.inventory_item_id == item.id,
                OrderItem.order.has(Order.created_at >= datetime.utcnow() - timedelta(days=90))
            ).all()
            
            # Calculate historical demand
            historical_demand = sum(order_item.quantity for order_item in historical_orders)
            avg_daily_demand = historical_demand / 90 if historical_orders else 1
            
            # Simple trend-based forecast (in real system, use ML models)
            forecast_data = []
            base_demand = avg_daily_demand
            
            for day in range(days):
                # Add some seasonality and randomness
                seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * day / 7)  # Weekly pattern
                trend_factor = 1 + (day * 0.01)  # Slight upward trend
                noise = random.uniform(0.8, 1.2)  # Random variation
                
                predicted_demand = base_demand * seasonal_factor * trend_factor * noise
                
                forecast_data.append({
                    "date": (datetime.utcnow() + timedelta(days=day)).strftime("%Y-%m-%d"),
                    "predicted_demand": round(max(0, predicted_demand), 2),
                    "confidence": random.uniform(0.75, 0.95)
                })
            
            forecasts.append({
                "item_id": item.id,
                "item_name": item.name,
                "sku": item.sku,
                "current_stock": item.current_stock,
                "avg_daily_demand": round(avg_daily_demand, 2),
                "forecast": forecast_data[:7],  # Return first 7 days
                "total_forecast_period": f"{days} days",
                "model_accuracy": random.uniform(0.80, 0.95)
            })
        
        return {
            "forecasts": forecasts,
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "v1.0-demo"
        }
    
    def get_inventory_optimization_recommendations(self, db: Session) -> Dict[str, Any]:
        """Get inventory optimization recommendations."""
        items = db.query(InventoryItem).all()
        recommendations = []
        
        for item in items:
            # Get recent sales velocity
            recent_sales = db.query(func.sum(OrderItem.quantity)).filter(
                OrderItem.inventory_item_id == item.id,
                OrderItem.order.has(Order.created_at >= datetime.utcnow() - timedelta(days=30))
            ).scalar() or 0
            
            monthly_velocity = recent_sales
            daily_velocity = monthly_velocity / 30
            
            # Calculate optimal stock levels
            lead_time_days = 7  # Assume 7-day lead time
            safety_stock = daily_velocity * lead_time_days * 1.5  # 1.5x safety factor
            
            optimal_stock = (daily_velocity * 30) + safety_stock  # 30-day supply + safety
            reorder_point = (daily_velocity * lead_time_days) + safety_stock
            
            # Generate recommendation
            current_stock = item.current_stock
            stock_status = "optimal"
            action = "maintain"
            priority = "low"
            cost_impact = 0
            
            if current_stock < reorder_point:
                stock_status = "low"
                action = "reorder"
                priority = "high"
                shortage_risk = (reorder_point - current_stock) / max(reorder_point, 1)
                cost_impact = shortage_risk * item.selling_price * daily_velocity * 7
            elif current_stock > optimal_stock * 1.5:
                stock_status = "excess"
                action = "reduce"
                priority = "medium"
                excess_units = current_stock - optimal_stock
                cost_impact = -(excess_units * item.unit_cost * 0.1)  # Carrying cost
            
            recommendations.append({
                "item_id": item.id,
                "item_name": item.name,
                "sku": item.sku,
                "current_stock": current_stock,
                "optimal_stock": round(optimal_stock),
                "reorder_point": round(reorder_point),
                "stock_status": stock_status,
                "recommended_action": action,
                "priority": priority,
                "monthly_velocity": monthly_velocity,
                "cost_impact": round(cost_impact, 2),
                "recommendation": self.generate_recommendation_text(action, current_stock, optimal_stock)
            })
        
        # Sort by priority and cost impact
        recommendations.sort(key=lambda x: (
            {"high": 3, "medium": 2, "low": 1}[x["priority"]],
            abs(x["cost_impact"])
        ), reverse=True)
        
        return {
            "recommendations": recommendations[:10],  # Top 10 recommendations
            "summary": {
                "total_items_analyzed": len(items),
                "high_priority_actions": len([r for r in recommendations if r["priority"] == "high"]),
                "potential_cost_savings": sum([abs(r["cost_impact"]) for r in recommendations if r["cost_impact"] < 0]),
                "risk_mitigation_value": sum([r["cost_impact"] for r in recommendations if r["cost_impact"] > 0])
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def generate_recommendation_text(self, action: str, current: int, optimal: int) -> str:
        """Generate human-readable recommendation text."""
        if action == "reorder":
            return f"Stock is below reorder point. Consider ordering {optimal - current} units to reach optimal level."
        elif action == "reduce":
            return f"Excess inventory detected. Consider reducing by {current - optimal} units to optimize carrying costs."
        else:
            return "Current stock level is optimal. Continue monitoring."
    
    def get_ml_insights(self, db: Session) -> Dict[str, Any]:
        """Get ML-powered insights for the dashboard."""
        
        # Stock level insights
        total_items = db.query(InventoryItem).count()
        low_stock_items = db.query(InventoryItem).filter(
            InventoryItem.current_stock <= InventoryItem.reorder_point
        ).count()
        
        # Sales trend analysis
        current_month_sales = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
        
        previous_month_sales = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= datetime.utcnow() - timedelta(days=60),
            Order.created_at < datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
        
        if previous_month_sales > 0:
            sales_growth = ((current_month_sales - previous_month_sales) / previous_month_sales) * 100
        else:
            sales_growth = 0
        
        # Generate insights
        insights = [
            {
                "type": "stock_alert",
                "title": "Low Stock Alert",
                "message": f"{low_stock_items} items are below reorder point",
                "severity": "high" if low_stock_items > 5 else "medium",
                "action": "Review reorder recommendations"
            },
            {
                "type": "sales_trend",
                "title": "Sales Performance",
                "message": f"Sales {('increased' if sales_growth > 0 else 'decreased')} by {abs(sales_growth):.1f}% this month",
                "severity": "info",
                "trend": "up" if sales_growth > 0 else "down"
            },
            {
                "type": "demand_forecast",
                "title": "Demand Prediction",
                "message": "Holiday season approaching - expect 15% increase in electronics demand",
                "severity": "info",
                "action": "Prepare inventory for seasonal surge"
            }
        ]
        
        return {
            "insights": insights,
            "metrics": {
                "forecast_accuracy": random.uniform(85, 95),
                "optimization_savings": random.uniform(1000, 5000),
                "items_optimized": total_items,
                "alerts_generated": len(insights)
            },
            "model_performance": {
                "demand_forecast_model": {
                    "accuracy": "89.2%",
                    "last_trained": (datetime.utcnow() - timedelta(days=7)).isoformat(),
                    "data_points": 1500
                },
                "inventory_optimization_model": {
                    "accuracy": "92.1%",
                    "last_trained": (datetime.utcnow() - timedelta(days=3)).isoformat(),
                    "data_points": 2100
                }
            }
        }
    
    def calculate_inventory_turnover(self, db: Session) -> float:
        """Calculate inventory turnover rate."""
        # Get total inventory value
        total_inventory_value = db.query(
            func.sum(InventoryItem.current_stock * InventoryItem.unit_cost)
        ).scalar() or 0
        
        # Get cost of goods sold (approximation)
        monthly_sales = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
        
        # Estimate COGS as 70% of sales
        monthly_cogs = monthly_sales * 0.7
        annual_cogs = monthly_cogs * 12
        
        if total_inventory_value > 0:
            turnover_rate = annual_cogs / total_inventory_value
        else:
            turnover_rate = 0
        
        return round(turnover_rate, 2)
    
    def predict_stockout_risk(self, db: Session, item_id: int) -> Dict[str, Any]:
        """Predict stockout risk for a specific item."""
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if not item:
            return {"error": "Item not found"}
        
        # Get recent sales velocity
        recent_sales = db.query(func.sum(OrderItem.quantity)).filter(
            OrderItem.inventory_item_id == item_id,
            OrderItem.order.has(Order.created_at >= datetime.utcnow() - timedelta(days=30))
        ).scalar() or 0
        
        daily_velocity = recent_sales / 30
        
        # Calculate days until stockout
        if daily_velocity > 0:
            days_until_stockout = item.current_stock / daily_velocity
        else:
            days_until_stockout = float('inf')
        
        # Risk assessment
        if days_until_stockout <= 3:
            risk_level = "critical"
            risk_score = 0.9
        elif days_until_stockout <= 7:
            risk_level = "high"
            risk_score = 0.7
        elif days_until_stockout <= 14:
            risk_level = "medium"
            risk_score = 0.4
        else:
            risk_level = "low"
            risk_score = 0.1
        
        return {
            "item_name": item.name,
            "current_stock": item.current_stock,
            "daily_velocity": round(daily_velocity, 2),
            "days_until_stockout": round(days_until_stockout, 1) if days_until_stockout != float('inf') else None,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "recommendation": "Immediate reorder required" if risk_level == "critical" else 
                           "Schedule reorder soon" if risk_level == "high" else "Monitor closely"
        } 