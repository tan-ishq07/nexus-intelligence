import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score
from app.services.intelligence.data_loader import data_loader

class ClusteringEngine:
    """
    Core Intelligence Engine: Multidimensional Unsupervised Clustering & Segmentation.
    Implements K-Means, Agglomerative Hierarchical, DBSCAN, and Gaussian Mixture Models.
    Projects clusters onto 2D PCA space and computes mathematical validity scores.
    """

    SEGMENTATION_TARGETS = {
        "suppliers": "Supplier Operational & Geopolitical Segmentation",
        "warehouses": "Fulfillment Hub & Capacity Utilization Segmentation",
        "products": "Product Demand Volatility & Velocity (ABC/XYZ) Segmentation"
    }

    def run_clustering(
        self,
        target: str = "suppliers",
        algorithm: str = "kmeans",
        n_clusters: int = 4,
        eps: float = 0.8,
        min_samples: int = 4
    ) -> Dict[str, Any]:
        """
        Executes chosen clustering algorithm over target warehouse dataset,
        scales features, projects onto PCA 2D coordinates, and extracts cluster profiles.
        """
        if target not in self.SEGMENTATION_TARGETS:
            target = "suppliers"

        # 1. Load data and features
        df, features = data_loader.get_clustering_data(target)
        X_raw = df[features].values

        # 2. Standardize features to zero mean, unit variance
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        # 3. Fit chosen clustering algorithm
        algorithm = algorithm.lower()
        if algorithm == "hierarchical":
            model = AgglomerativeClustering(n_clusters=n_clusters, metric="euclidean", linkage="ward")
            labels = model.fit_predict(X_scaled)
        elif algorithm == "dbscan":
            model = DBSCAN(eps=eps, min_samples=min_samples)
            labels = model.fit_predict(X_scaled)
            # In DBSCAN, -1 is noise
            unique_labels = set(labels)
            n_clusters = len(unique_labels - {-1})
        elif algorithm == "gmm":
            model = GaussianMixture(n_components=n_clusters, random_state=42)
            labels = model.fit_predict(X_scaled)
        else: # Default K-Means
            algorithm = "kmeans"
            model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = model.fit_predict(X_scaled)

        df["cluster"] = labels

        # 4. Evaluation metrics (Silhouette & Davies-Bouldin)
        # Silhouette requires at least 2 clusters and at least 2 points per cluster, excluding noise-only
        non_noise_mask = labels != -1
        if len(set(labels[non_noise_mask])) >= 2 and np.sum(non_noise_mask) > len(set(labels[non_noise_mask])):
            sil_score = round(float(silhouette_score(X_scaled[non_noise_mask], labels[non_noise_mask])), 3)
            db_score = round(float(davies_bouldin_score(X_scaled[non_noise_mask], labels[non_noise_mask])), 3)
        else:
            sil_score = 0.0
            db_score = 0.0

        # 5. 2D PCA Dimensionality Reduction for Visualization
        pca = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_scaled)
        explained_variance = [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_]

        # 6. Scatter Points payload
        scatter_points = []
        name_col = "supplier_name" if "supplier_name" in df.columns else ("name" if "name" in df.columns else "product_name")
        id_col = "supplier_id" if "supplier_id" in df.columns else ("name" if "name" in df.columns else "sku_id")

        for idx, row in df.iterrows():
            cluster_id = int(labels[idx])
            scatter_points.append({
                "id": str(row.get(id_col, f"item-{idx}")),
                "name": str(row.get(name_col, f"Entity {idx+1}")),
                "cluster": cluster_id,
                "cluster_label": self._get_cluster_business_label(target, cluster_id),
                "x": round(float(X_pca[idx, 0]), 3),
                "y": round(float(X_pca[idx, 1]), 3),
                "primary_metric": round(float(row[features[0]]), 2),
                "secondary_metric": round(float(row[features[1]]), 2)
            })

        # 7. Cluster Profiles & Means
        cluster_profiles = []
        unique_c = sorted(list(set(labels)))
        for c in unique_c:
            c_mask = labels == c
            c_df = df[c_mask]
            size = int(len(c_df))
            share_pct = round((size / len(df)) * 100, 1)

            feature_means = {}
            for f in features:
                feature_means[f] = round(float(c_df[f].mean()), 2)

            is_noise = (c == -1)
            cluster_profiles.append({
                "cluster_id": int(c),
                "label": "Outlier / Noise Cluster" if is_noise else self._get_cluster_business_label(target, int(c)),
                "size": size,
                "share_pct": share_pct,
                "is_noise": bool(is_noise),
                "metrics": feature_means,
                "interpretation": self._generate_cluster_interpretation(target, int(c), feature_means)
            })

        raw_result = {
            "target": target,
            "target_label": self.SEGMENTATION_TARGETS[target],
            "algorithm": algorithm.upper(),
            "clusters_count": int(n_clusters),
            "total_entities": int(len(df)),
            "silhouette_score": sil_score,
            "davies_bouldin_score": db_score,
            "pca_explained_variance_pct": explained_variance,
            "features_used": features,
            "cluster_profiles": cluster_profiles,
            "scatter_points": scatter_points[:300] # Cap for smooth WebGL/SVG rendering
        }

        def sanitize(obj):
            if isinstance(obj, (np.integer, np.int32, np.int64)):
                return int(obj)
            if isinstance(obj, (np.floating, np.float32, np.float64)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return [sanitize(x) for x in obj]
            if isinstance(obj, dict):
                return {str(k): sanitize(v) for k, v in obj.items()}
            if isinstance(obj, (list, tuple, set)):
                return [sanitize(x) for x in obj]
            return obj

        return sanitize(raw_result)

    def _get_cluster_business_label(self, target: str, cluster_id: int) -> str:
        if cluster_id == -1:
            return "Outliers & High-Variance Deviations"
        
        labels_map = {
            "suppliers": [
                "Tier-1 Strategic Partnerships (High Reliability)",
                "Volatile Lead Time / Single-Source Risk",
                "Low-Risk Domestic Commoditised",
                "High Geopolitical / Border Friction"
            ],
            "warehouses": [
                "High-Throughput Global Gateway Super-Hubs",
                "Capacity Constrained Regional Facilities",
                "Optimized Low-Cost Inactive Buffers",
                "High-Cost Specialized Temperature Controlled"
            ],
            "products": [
                "Class A: Fast-Moving Strategic Components",
                "Class B: Moderate Velocity Bulk Stock",
                "Class C: Long-Tail High-Margin Critical Spares",
                "Erratic Demand / High Volatility Outliers"
            ]
        }
        domain_labels = labels_map.get(target, ["Segment Alpha", "Segment Beta", "Segment Gamma", "Segment Delta"])
        return domain_labels[cluster_id % len(domain_labels)]

    def _generate_cluster_interpretation(self, target: str, cluster_id: int, metrics: Dict[str, float]) -> str:
        if target == "suppliers":
            lead = metrics.get("lead_time_days", 0)
            rel = metrics.get("historical_on_time_rate", 0)
            geo = metrics.get("geopolitical_risk_score", 0)
            return f"Average lead time of {lead:.1f} days, {rel:.1f}% delivery reliability, with geopolitical friction index at {geo:.1f}/100."
        elif target == "warehouses":
            util = metrics.get("utilization_pct", 0)
            thru = metrics.get("throughput_daily", 0)
            return f"Operates at {util:.1f}% capacity utilization handling {thru:,.0f} units daily."
        else:
            vol = metrics.get("mean_demand", 0)
            cv = metrics.get("demand_cv", 0)
            return f"Mean daily velocity of {vol:,.0f} units with coefficient of variation at {cv:.2f}."

clustering_engine = ClusteringEngine()
