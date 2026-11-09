"""
common.py — Shared configuration and utilities for both pages.
Edit the paths and column definitions here.
"""

import streamlit as st
import pandas as pd

# ============================================================================
# CONFIG — Edit these to match your setup
# ============================================================================

# Path to your cluster members catalogue (CSV or TSV)
# The catalogue ships next to this file, so load it by relative path.
# (Upstream points at an absolute path on the author's machine.)
CATALOGUE_PATH = "catalogue_st.csv"
CATALOGUE_SEP = ","  # change to "\t" for TSV

# ============================================================================
# Column definitions
# ============================================================================

# Physical property filters (sidebar sliders on Gallery page, expander on Scatter page)
PHYSICAL_DISPLAY = {
    "Ph. Redshift": {
        "col": "phz_median",
        "step": 0.005,
        "format": "%.3f",
    },
    "Stellar Mass (log M☉)": {
        "col": "phz_pp_median_stellarmass",
        "step": 0.1,
        "format": "%.1f",
    },
    "r / r500": {
        "col": "r_r500",
        "step": 0.05,
        "format": "%.2f",
    },
    "Local projected density": {
        "col": "sigma_4_5_log",
        "step": 0.1,
        "format": "%.1f",
    },
}

# Zoobot morphology columns (used as scatter axes and gallery filters)
# "col" is the actual CSV column; for p_bar we compute 1 - bar_no_fraction
ZOOBOT_DISPLAY = {
    "Smooth fraction": {
        "col": "smooth-or-featured_smooth_fraction",
    },
    "Featured fraction": {
        "col": "smooth-or-featured_featured-or-disk_fraction",
    },
    "Bar probability (p_bar)": {
        "col": "p_bar",  # derived column, see load_data()
    },
    "Bar strong fraction": {
        "col": "bar_strong_fraction",
    },
    "Bar weak fraction": {
        "col": "bar_weak_fraction",
    },
    "Edge-on fraction": {
        "col": "disk-edge-on_yes_fraction",
    },
    "Has spiral arms": {
        "col": "has-spiral-arms_yes_fraction",
    },
    "Bulge size (dominant)": {
        "col": "bulge-size_dominant_fraction",
    },
    "Merging fraction": {
        "col": "merging_merger_fraction",
    },
}


# ============================================================================
# Data loading
# ============================================================================

@st.cache_data
def load_data() -> pd.DataFrame:
    df = pd.read_csv(CATALOGUE_PATH, sep=CATALOGUE_SEP,dtype={"object_id": str})

    # Derived column: bar probability = 1 - bar_no_fraction
    if "bar_no_fraction" in df.columns:
        df["p_bar"] = 1.0 - df["bar_no_fraction"]

    return df


# ============================================================================
# Shared utilities
# ============================================================================

def get_esasky_url(ra: float, dec: float) -> str:
    """ESASky link — adjust the HiPS layer as needed."""
    return (
        f"https://sky.esa.int/esasky/?hide_welcome=true&hide_banner_info=true"
        f"&target={ra}%20{dec}"
        f"&hips=Euclid+VIS&fov=0.01"
        f"&projection=TAN&cooframe=J2000&sci=false&lang=en"
    )
