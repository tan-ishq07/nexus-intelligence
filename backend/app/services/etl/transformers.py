import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple, List

class DataTransformer:
    @staticmethod
    def clean_missing_values(df: pd.DataFrame, strategy: str = "auto") -> Tuple[pd.DataFrame, Dict[str, int]]:
        df_clean = df.copy()
        imputed_counts = {}
        for col in df_clean.columns:
            null_count = df_clean[col].isnull().sum()
            if null_count > 0:
                imputed_counts[col] = int(null_count)
                if pd.api.types.is_numeric_dtype(df_clean[col]):
                    median_val = df_clean[col].median()
                    df_clean[col] = df_clean[col].fillna(median_val if not pd.isna(median_val) else 0)
                else:
                    mode_val = df_clean[col].mode()
                    fill_val = mode_val[0] if len(mode_val) > 0 else "Unknown"
                    df_clean[col] = df_clean[col].fillna(fill_val)
        return df_clean, imputed_counts

    @staticmethod
    def detect_and_remove_duplicates(df: pd.DataFrame, subset: List[str] = None) -> Tuple[pd.DataFrame, int]:
        initial_len = len(df)
        df_dedup = df.drop_duplicates(subset=subset)
        duplicates_removed = initial_len - len(df_dedup)
        return df_dedup, duplicates_removed

    @staticmethod
    def identify_outliers_iqr(df: pd.DataFrame, numeric_col: str) -> Tuple[pd.Series, float, float]:
        if numeric_col not in df.columns or not pd.api.types.is_numeric_dtype(df[numeric_col]):
            return pd.Series(False, index=df.index), 0.0, 0.0
        q1 = df[numeric_col].quantile(0.25)
        q3 = df[numeric_col].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outlier_mask = (df[numeric_col] < lower_bound) | (df[numeric_col] > upper_bound)
        return outlier_mask, float(lower_bound), float(upper_bound)

    @staticmethod
    def normalize_min_max(df: pd.DataFrame, column: str) -> pd.Series:
        col = df[column]
        min_val, max_val = col.min(), col.max()
        if max_val == min_val:
            return pd.Series(0.0, index=df.index)
        return (col - min_val) / (max_val - min_val)

    @staticmethod
    def parse_date_key(dt_str: Any) -> int:
        if not dt_str or pd.isna(dt_str):
            return 19700101
        try:
            if isinstance(dt_str, (datetime, pd.Timestamp)):
                dt = dt_str
            else:
                dt = pd.to_datetime(dt_str)
            return dt.year * 10000 + dt.month * 100 + dt.day
        except Exception:
            return 19700101

    @staticmethod
    def discretize_price_band(price: float) -> str:
        if price < 50:
            return "Budget (<$50)"
        elif price < 300:
            return "Standard ($50-$300)"
        elif price < 1500:
            return "Premium ($300-$1500)"
        return "Ultra Capital (>$1500)"

    @staticmethod
    def discretize_delay_hours(delay: float) -> str:
        if delay <= 0:
            return "On-Time / Early"
        elif delay <= 6:
            return "Minor Delay (1-6h)"
        elif delay <= 24:
            return "Moderate Delay (6-24h)"
        return "Severe Delay (>24h)"

    @staticmethod
    def build_concept_hierarchy(df: pd.DataFrame) -> Dict[str, Any]:
        # Geographic and Product Category Hierarchies
        geo_hierarchy = {}
        if "region" in df.columns and "country" in df.columns:
            for _, row in df[["region", "country"]].drop_duplicates().iterrows():
                r, c = str(row["region"]), str(row["country"])
                if r not in geo_hierarchy:
                    geo_hierarchy[r] = []
                if c not in geo_hierarchy[r]:
                    geo_hierarchy[r].append(c)

        return {
            "geographic_hierarchy": geo_hierarchy,
            "temporal_hierarchy": ["Year", "Quarter", "Month", "Week", "Day"],
            "discretization_schemes": ["Price Bands", "Delay Severity", "Risk Tiers"]
        }
