"""
Page 1 — Cutout Explorer
"""

import streamlit as st
import numpy as np
import pandas as pd
from common import (
    load_data, get_esasky_url, cutout_url, slider_bounds, in_range,
    ZOOBOT_DISPLAY, PHYSICAL_DISPLAY,
)

st.set_page_config(layout="wide", page_title="Cutout Explorer")


def build_sidebar_filters(df):
    mask = np.ones(len(df), dtype=bool)

    st.sidebar.markdown("## Physical properties")
    for label, spec in PHYSICAL_DISPLAY.items():
        col = spec["col"]
        if col not in df.columns:
            continue
        col_data = df[col].dropna()
        if len(col_data) == 0:
            continue
        if col_data.min() >= col_data.max():
            continue
        step = spec.get("step", (col_data.max() - col_data.min()) / 100)
        cmin, cmax = slider_bounds(col_data, step)
        fmt = spec.get("format", "%.2f")

        vmin, vmax = st.sidebar.slider(
            label, cmin, cmax, (cmin, cmax),
            step=step, format=fmt, key=f"phys_{col}",
        )
        slider_untouched = (vmin <= cmin + step * 0.5) and (vmax >= cmax - step * 0.5)
        if not slider_untouched:
            mask &= in_range(df[col], vmin, vmax, step)

    st.sidebar.markdown("## Zoobot morphology")
    for label, spec in ZOOBOT_DISPLAY.items():
        col = spec["col"]
        if col not in df.columns:
            continue
        vmin, vmax = st.sidebar.slider(
            label, 0.0, 1.0, (0.0, 1.0),
            step=0.01, format="%.2f", key=f"zb_{col}",
        )
        slider_untouched = (vmin <= 0.005) and (vmax >= 0.995)
        if not slider_untouched:
            mask &= (df[col].fillna(-np.inf) >= vmin) & (df[col].fillna(np.inf) <= vmax)

    return mask


def display_gallery(df):
    css = """
    <style>
    .gallery { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; padding:10px 0; }
    .gcard { text-align:center; width:215px; }
    .gcard img { width:200px; height:200px; object-fit:cover; border-radius:6px;
                 border:2px solid transparent; transition:border-color .2s;
                 background:#111; }
    .gcard img:hover { border-color:#FF4B4B; }
    .gcard .cbtn { display:inline-block; margin-top:4px; padding:2px 8px;
                   background:#262730; color:#FAFAFA; border-radius:4px;
                   font-size:11px; text-decoration:none; font-family:monospace; }
    .gcard .cbtn:hover { background:#FF4B4B; }
    .gcard .olbl { font-size:10px; color:#888; margin-top:2px; overflow:hidden;
                   text-overflow:ellipsis; white-space:nowrap; }
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

    cards = ""
    for _, row in df.iterrows():
        fname = row.get("jpg_loc_gz_arcsinh_vis_y")
        if not fname or pd.isna(fname):
            continue
        url = cutout_url(fname)
        esasky = get_esasky_url(row["right_ascension"], row["declination"])
        oid = row["object_id"]
        ra, dec = row["right_ascension"], row["declination"]
        cards += f"""
        <div class="gcard">
            <img src="{url}" alt="{oid}" loading="lazy">
            <div class="olbl" title="{oid}">{oid}</div>
            <a class="cbtn" href="{esasky}" target="_blank">{ra:.4f}, {dec:.4f}</a>
        </div>"""

    st.markdown(f'<div class="gallery">{cards}</div>', unsafe_allow_html=True)


def main():
    df = load_data()

    st.title("Cluster Member Explorer")
    st.markdown(
        "Filter cluster members with the sidebar sliders. "
        "**Click coordinates** to visualize the galaxy in ESASky."
    )

    st.sidebar.markdown("# Filters")
    mask = build_sidebar_filters(df)
    n_match = int(mask.sum())

    col1, col2 = st.columns([2, 1])
    all_sortable = {**PHYSICAL_DISPLAY, **ZOOBOT_DISPLAY}
    sort_labels = list(all_sortable.keys())

    with col1:
        sort_label = st.selectbox("Prioritise by", sort_labels)
    with col2:
        sort_dir = st.radio("Direction", ["High → Low", "Low → High"], horizontal=True)

    ascending = sort_dir == "Low → High"
    sort_col = all_sortable[sort_label]["col"]

    filtered = df[mask]
    if sort_col in filtered.columns:
        selected = filtered.sort_values(sort_col, ascending=ascending).head(30)
    else:
        selected = filtered.head(30)

    st.markdown(
        f"**{n_match:,}** of **{len(df):,}** galaxies match. Showing **{len(selected)}**."
    )

    if len(selected) == 0:
        st.warning("No galaxies match — try relaxing the filters.")
    else:
        display_gallery(selected)

        st.markdown("### Properties of displayed galaxies")
        table_cols = [
            "object_id", "right_ascension", "declination",
            "phz_median", "phz_pp_median_stellarmass",
            "r_r500", "sigma_4_5_log", "p_member",
            "smooth-or-featured_smooth_fraction",
            "smooth-or-featured_featured-or-disk_fraction",
            "p_bar",
        ]
        table_cols = [c for c in table_cols if c in selected.columns]
        table_df = selected[table_cols].copy().reset_index(drop=True)
        table_df = table_df.rename(columns={
            "object_id": "Source ID",
            "right_ascension": "RA",
            "declination": "Dec",
            "phz_median": "Ph. redshift",
            "phz_pp_median_stellarmass": "log M★/M☉",
            "r_r500": "r/r500",
            "sigma_4_5_log": "log Σ",
            "smooth-or-featured_smooth_fraction": "Smooth fraction",
            "smooth-or-featured_featured-or-disk_fraction": "Featured fraction",
            "p_bar": "p_bar",
        })

        st.dataframe(table_df, use_container_width=True, hide_index=True)

        csv_data = table_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="Download table as CSV",
            data=csv_data,
            file_name="cluster_members_selection.csv",
            mime="text/csv",
        )


main()