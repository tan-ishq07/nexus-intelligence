import time
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules
from app.services.intelligence.data_loader import data_loader

class PatternDiscoveryEngine:
    """
    Core Intelligence Engine C: Hidden Pattern Discovery & Association Rule Mining.
    Implements Apriori and FP-Growth over transactional warehouse baskets.
    Supports constraint-based mining, correlation analysis, and network graph topology.
    """

    SUPPORTED_DATASETS = {
        "product_purchasing": "Product Purchasing Baskets (Cross-Selling & Bill of Materials)",
        "shipment_delays": "Shipment Delays & Disruption Multi-Factor Co-Occurrences",
        "inventory_exhaustion": "Inventory Stockout & Buffer Depletion Patterns",
        "supplier_product": "Strategic Supplier Tier & Component Relationships"
    }

    def get_available_datasets(self) -> List[Dict[str, str]]:
        return [
            {"id": k, "name": v, "description": f"Mining transactions for {k.replace('_', ' ')}"}
            for k, v in self.SUPPORTED_DATASETS.items()
        ]

    def mine_association_rules(
        self,
        dataset_name: str = "product_purchasing",
        algorithm: str = "fpgrowth",
        min_support: float = 0.05,
        min_confidence: float = 0.30,
        min_lift: float = 1.0,
        antecedent_filter: Optional[str] = None,
        consequent_filter: Optional[str] = None,
        max_len: Optional[int] = 4
    ) -> Dict[str, Any]:
        """
        Executes frequent itemset mining and association rule generation.
        Measures exact algorithm runtime and generates network topology.
        """
        if dataset_name not in self.SUPPORTED_DATASETS:
            dataset_name = "product_purchasing"

        # 1. Load transactions
        transactions = data_loader.get_association_transactions(dataset_name)
        if not transactions:
            return {
                "dataset": dataset_name,
                "algorithm": algorithm,
                "status": "NO_DATA",
                "rules": [],
                "frequent_itemsets": [],
                "runtime_ms": 0.0
            }

        # 2. Encode transactions into one-hot binary matrix
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df_encoded = pd.DataFrame(te_ary, columns=te.columns_)

        # 3. Mine frequent itemsets
        start_time = time.perf_counter()
        if algorithm.lower() == "apriori":
            frequent_itemsets = apriori(
                df_encoded,
                min_support=min_support,
                use_colnames=True,
                max_len=max_len
            )
        else: # Default to fpgrowth
            algorithm = "fpgrowth"
            frequent_itemsets = fpgrowth(
                df_encoded,
                min_support=min_support,
                use_colnames=True,
                max_len=max_len
            )
        mining_duration_ms = (time.perf_counter() - start_time) * 1000.0

        if frequent_itemsets.empty:
            return {
                "dataset": dataset_name,
                "dataset_label": self.SUPPORTED_DATASETS[dataset_name],
                "algorithm": algorithm,
                "min_support": min_support,
                "min_confidence": min_confidence,
                "transaction_count": len(transactions),
                "item_count": len(te.columns_),
                "frequent_itemsets_count": 0,
                "rules_count": 0,
                "runtime_ms": round(mining_duration_ms, 2),
                "frequent_itemsets": [],
                "rules": [],
                "network_graph": {"nodes": [], "links": []},
                "summary": "No itemsets exceeded the minimum support threshold. Try lowering min_support."
            }

        # Calculate itemset length
        frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(lambda x: len(x))

        # 4. Generate association rules
        rules_df = association_rules(
            frequent_itemsets,
            metric="confidence",
            min_threshold=min_confidence,
            num_itemsets=len(transactions)
        )

        # Apply Lift and Constraint Filters
        if not rules_df.empty:
            if min_lift > 1.0:
                rules_df = rules_df[rules_df["lift"] >= min_lift]

            if antecedent_filter:
                rules_df = rules_df[rules_df["antecedents"].apply(
                    lambda ants: any(antecedent_filter.lower() in str(item).lower() for item in ants)
                )]

            if consequent_filter:
                rules_df = rules_df[rules_df["consequents"].apply(
                    lambda cons: any(consequent_filter.lower() in str(item).lower() for item in cons)
                )]

            # Sort by lift descending
            rules_df = rules_df.sort_values(by="lift", ascending=False)

        # Format frequent itemsets for API
        formatted_itemsets = []
        for _, row in frequent_itemsets.sort_values(by="support", ascending=False).head(30).iterrows():
            formatted_itemsets.append({
                "items": list(row["itemsets"]),
                "support": round(float(row["support"]), 4),
                "length": int(row["length"])
            })

        # Format rules and construct interactive network graph
        formatted_rules = []
        nodes_dict = {}
        links = []

        if not rules_df.empty:
            for idx, row in rules_df.head(50).iterrows():
                ants = list(row["antecedents"])
                cons = list(row["consequents"])
                lift = round(float(row["lift"]), 3)
                confidence = round(float(row["confidence"]), 3)
                support = round(float(row["support"]), 4)
                
                # Leverage & Conviction
                leverage = round(float(row.get("leverage", 0.0)), 4)
                conviction = round(float(row.get("conviction", 1.0)), 3)
                if np.isinf(conviction) or np.isnan(conviction):
                    conviction = 99.9

                # Business impact severity categorization
                if lift >= 3.0 and confidence >= 0.75:
                    severity = "critical"
                elif lift >= 1.8 and confidence >= 0.50:
                    severity = "warning"
                else:
                    severity = "info"

                rule_id = f"RULE-{dataset_name[:3].upper()}-{len(formatted_rules) + 1:03d}"
                formatted_rules.append({
                    "id": rule_id,
                    "antecedents": ants,
                    "consequents": cons,
                    "support": support,
                    "confidence": confidence,
                    "lift": lift,
                    "leverage": leverage,
                    "conviction": conviction,
                    "severity": severity,
                    "business_impact": self._generate_rule_impact(dataset_name, ants, cons, lift)
                })

                # Register nodes and links for graph visualization
                for item in ants + cons:
                    if item not in nodes_dict:
                        nodes_dict[item] = {
                            "id": item,
                            "name": item,
                            "type": "antecedent" if item in ants else "consequent",
                            "frequency": 1
                        }
                    else:
                        nodes_dict[item]["frequency"] += 1

                for a in ants:
                    for c in cons:
                        links.append({
                            "source": a,
                            "target": c,
                            "lift": lift,
                            "confidence": confidence,
                            "support": support
                        })

        return {
            "dataset": dataset_name,
            "dataset_label": self.SUPPORTED_DATASETS[dataset_name],
            "algorithm": algorithm.upper(),
            "min_support": min_support,
            "min_confidence": min_confidence,
            "min_lift": min_lift,
            "transaction_count": len(transactions),
            "item_count": len(te.columns_),
            "frequent_itemsets_count": len(frequent_itemsets),
            "rules_count": len(formatted_rules),
            "runtime_ms": round(mining_duration_ms, 2),
            "frequent_itemsets": formatted_itemsets,
            "rules": formatted_rules,
            "network_graph": {
                "nodes": list(nodes_dict.values()),
                "links": links[:60] # Top 60 connections for rendering performance
            }
        }

    def compare_algorithms(self, dataset_name: str = "product_purchasing", min_support: float = 0.05) -> Dict[str, Any]:
        """
        Runs both Apriori and FP-Growth over the identical transaction matrix
        to benchmark runtime latency, memory efficiency, and itemset yield.
        """
        transactions = data_loader.get_association_transactions(dataset_name)
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df_encoded = pd.DataFrame(te_ary, columns=te.columns_)

        # Apriori Benchmark
        t0 = time.perf_counter()
        apriori_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
        apriori_time = (time.perf_counter() - t0) * 1000.0

        # FP-Growth Benchmark
        t1 = time.perf_counter()
        fpgrowth_itemsets = fpgrowth(df_encoded, min_support=min_support, use_colnames=True)
        fpgrowth_time = (time.perf_counter() - t1) * 1000.0

        speedup_factor = round(apriori_time / max(fpgrowth_time, 0.01), 2)

        return {
            "dataset": dataset_name,
            "min_support": min_support,
            "transaction_count": len(transactions),
            "unique_items": len(te.columns_),
            "benchmarks": [
                {
                    "algorithm": "FP-Growth",
                    "execution_time_ms": round(fpgrowth_time, 2),
                    "itemsets_found": len(fpgrowth_itemsets),
                    "algorithmic_complexity": "O(N * M) Prefix Tree",
                    "recommended_for": "Large transactional streams / Dense baskets"
                },
                {
                    "algorithm": "Apriori",
                    "execution_time_ms": round(apriori_time, 2),
                    "itemsets_found": len(apriori_itemsets),
                    "algorithmic_complexity": "O(2^M) Candidate Generation",
                    "recommended_for": "Small datasets / Educational inspection"
                }
            ],
            "speedup_ratio": f"{speedup_factor}x faster with FP-Growth",
            "itemset_parity": len(apriori_itemsets) == len(fpgrowth_itemsets)
        }

    def _generate_rule_impact(self, dataset: str, ants: List[str], cons: List[str], lift: float) -> str:
        ants_str = ", ".join(ants[:2])
        cons_str = ", ".join(cons[:2])
        if dataset == "shipment_delays":
            return f"When '{ants_str}' occurs, probability of cascading '{cons_str}' surges {lift:.1f}x above baseline."
        elif dataset == "inventory_exhaustion":
            return f"Depletion of '{ants_str}' strongly correlates ({lift:.1f}x) with immediate stockout of '{cons_str}'."
        elif dataset == "product_purchasing":
            return f"High bundling elasticity: Orders containing '{ants_str}' have {lift:.1f}x affinity for '{cons_str}'."
        else:
            return f"Structural dependency: '{ants_str}' predicts operational coupling with '{cons_str}' (Lift: {lift:.1f}x)."

pattern_engine = PatternDiscoveryEngine()
