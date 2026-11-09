"""
common.py — Shared configuration and utilities for both pages.
"""

import streamlit as st
import pandas as pd
from pathlib import Path

# ============================================================================
# CONFIG
# ============================================================================

CATALOGUE_PATH = "catalogue_st.csv"   # relative path in the repo
CATALOGUE_SEP = ","

# Public HF dataset where cutouts live
CUTOUT_BASE_URL = (
    "https://huggingface.co/datasets/pmb17/euclid-cluster-cutouts/"
    "resolve/main/cutouts"
)

# ============================================================================
# Column definitions
# ============================================================================

PHYSICAL_DISPLAY = {
    "Ph. Redshift": {
        "col": "phz_median", "step": 0.005, "format": "%.3f",
    },
    "Stellar Mass (log M☉)": {
        "col": "phz_pp_median_stellarmass", "step": 0.1, "format": "%.1f",
    },
    "r / r500": {
        "col": "r_r500", "step": 0.05, "format": "%.2f",
    },
    "Local projected density": {
        "col": "sigma_4_5_log", "step": 0.1, "format": "%.1f",
    },
}

ZOOBOT_DISPLAY = {
    "Smooth fraction":         {"col": "smooth-or-featured_smooth_fraction"},
    "Featured fraction":       {"col": "smooth-or-featured_featured-or-disk_fraction"},
    "Bar probability (p_bar)": {"col": "p_bar"},
    "Bar strong fraction":     {"col": "bar_strong_fraction"},
    "Bar weak fraction":       {"col": "bar_weak_fraction"},
    "Edge-on fraction":        {"col": "disk-edge-on_yes_fraction"},
    "Has spiral arms":         {"col": "has-spiral-arms_yes_fraction"},
    "Bulge size (dominant)":   {"col": "bulge-size_dominant_fraction"},
    "Merging fraction":        {"col": "merging_merger_fraction"},
}


# ============================================================================
# Data loading
# ============================================================================

@st.cache_data
def load_data() -> pd.DataFrame:
    df = pd.read_csv(CATALOGUE_PATH, sep=CATALOGUE_SEP, dtype={"object_id": str})

    if "bar_no_fraction" in df.columns:
        df["p_bar"] = 1.0 - df["bar_no_fraction"]

    # Normalise cutout column to just the filename (robust to any absolute paths still in CSV)
    if "jpg_loc_gz_arcsinh_vis_y" in df.columns:
        df["jpg_loc_gz_arcsinh_vis_y"] = (
            df["jpg_loc_gz_arcsinh_vis_y"].astype(str).apply(lambda p: Path(p).name)
        )

    return df


# ============================================================================
# Shared utilities
# ============================================================================

def cutout_url(filename: str) -> str:
    """Return the public HF URL for a cutout JPG filename."""
    return f"{CUTOUT_BASE_URL}/{filename}"


def get_esasky_url(ra: float, dec: float) -> str:
    return (
        f"https://sky.esa.int/esasky/?hide_welcome=true&hide_banner_info=true"
        f"&target={ra}%20{dec}"
        f"&hips=Euclid+VIS&fov=0.01"
        f"&projection=TAN&cooframe=J2000&sci=false&lang=en"
    )