"""
Cluster Member Explorer — Home page
"""

import streamlit as st

st.set_page_config(layout="wide", page_title="Cluster Explorer", page_icon="🔭")

st.title("Cluster Member Catalogue Explorer")

st.markdown(
    """
    Interactive tool for exploring galaxy cluster members using 
    [Zoobot](https://github.com/mwalmsley/zoobot) morphology predictions
    and Euclid physical properties.

    ### Pages

    **1. Cutout Explorer** — Browse 30 cutouts at a time, filtered by
    physical properties (redshift, stellar mass, local density, …) and
    Zoobot morphology fractions (smooth, featured, bar probability, …).
    Galaxies are sorted by a parameter of your choice.

    **2. Scatter Plot** — Interactive morphology scatter plot with Zoobot
    columns on each axis. Select up to 15 galaxies with lasso / box-select
    to inspect their properties and cutouts.

    ---
    Use the **sidebar** to navigate between pages.
    """
)
