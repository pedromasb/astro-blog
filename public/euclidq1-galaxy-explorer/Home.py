"""
Cluster Member Explorer — Home page
"""

import sys

import streamlit as st

# This copy also runs in the browser via stlite/Pyodide.
IS_WASM = sys.platform == "emscripten"

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


if IS_WASM:
    # Importing numpy, pandas and plotly into Pyodide takes a few seconds, and
    # that cost would otherwise land on the first click of a page. This runs
    # after the content above is on screen, so it is paid while the visitor is
    # still reading this page.
    import numpy  # noqa: F401
    import plotly.express  # noqa: F401

    import common  # noqa: F401
