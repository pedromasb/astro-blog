"""
Page 2 — Interactive Scatter Plot
"""

import streamlit as st
import numpy as np
import pandas as pd
import plotly.express as px
from common import (
    load_data, get_esasky_url, cutout_url, slider_bounds, in_range,
    ZOOBOT_DISPLAY, PHYSICAL_DISPLAY,
)

st.set_page_config(layout="wide", page_title="Scatter Explorer")


def main():
    df = load_data()

    st.title("Morphology Scatter Plot")
    st.markdown(
        "Choose a Zoobot column for each axis. "
        "**Select up to 15 galaxies** using the lasso/box tool or by clicking points. "
        "Their properties and cutouts will appear below."
    )

    zb_labels = list(ZOOBOT_DISPLAY.keys())
    col1, col2, col3 = st.columns([2, 2, 2])
    with col1:
        x_label = st.selectbox("X axis", zb_labels, index=0)
    with col2:
        y_label = st.selectbox("Y axis", zb_labels, index=1)
    with col3:
        colour_options = ["None"] + list(PHYSICAL_DISPLAY.keys()) + zb_labels
        colour_label = st.selectbox("Colour by", colour_options, index=0)

    x_col = ZOOBOT_DISPLAY[x_label]["col"]
    y_col = ZOOBOT_DISPLAY[y_label]["col"]

    if colour_label != "None":
        all_disp = {**PHYSICAL_DISPLAY, **ZOOBOT_DISPLAY}
        c_col = all_disp[colour_label]["col"]
    else:
        c_col = None

    with st.expander("Pre-filter by physical properties", expanded=False):
        mask = np.ones(len(df), dtype=bool)
        fcol1, fcol2, fcol3 = st.columns(3)
        for i, (label, spec) in enumerate(PHYSICAL_DISPLAY.items()):
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
            target = [fcol1, fcol2, fcol3][i % 3]
            with target:
                vmin, vmax = st.slider(
                    label, cmin, cmax, (cmin, cmax),
                    step=step, format=fmt, key=f"scatter_f_{col}",
                )
            slider_untouched = (vmin <= cmin + step * 0.5) and (vmax >= cmax - step * 0.5)
            if not slider_untouched:
                mask &= in_range(df[col], vmin, vmax, step)
        plot_df = df[mask].copy()

    st.caption(f"{len(plot_df):,} galaxies in plot after pre-filters.")

    plot_df = plot_df.dropna(subset=[x_col, y_col])

    hover_data = {
        "object_id": True,
        "right_ascension": ":.4f",
        "declination": ":.4f",
        "phz_median": ":.4f",
        "phz_pp_median_stellarmass": ":.2f",
        x_col: ":.3f",
        y_col: ":.3f",
    }

    fig = px.scatter(
        plot_df,
        x=x_col,
        y=y_col,
        color=c_col if c_col else None,
        hover_data=hover_data,
        color_continuous_scale="Burgyl" if c_col else None,
        opacity=0.8,
        render_mode="svg",
    )
    fig.update_layout(
        xaxis_title=x_label,
        yaxis_title=y_label,
        height=550,
        dragmode="lasso",
        margin=dict(l=50, r=50, t=30, b=50),
    )
    fig.update_traces(marker=dict(size=5))

    selected_event = st.plotly_chart(
        fig, use_container_width=True, on_select="rerun", key="scatter"
    )

    selected_indices = []
    if selected_event and selected_event.selection and selected_event.selection.point_indices:
        selected_indices = selected_event.selection.point_indices

    if len(selected_indices) == 0:
        st.info("Use the lasso or box-select tool on the plot to select galaxies (max 15).")
        return

    if len(selected_indices) > 15:
        st.warning(f"Selected {len(selected_indices)} — showing the first 15.")
        selected_indices = selected_indices[:15]

    sel_df = plot_df.iloc[selected_indices]

    st.markdown(f"### Selected galaxies ({len(sel_df)})")

    display_cols = [
        "object_id", "right_ascension", "declination",
        "phz_median", "phz_pp_median_stellarmass",
        x_col, y_col,
    ]
    display_cols = list(dict.fromkeys(display_cols))
    display_cols = [c for c in display_cols if c in sel_df.columns]

    rename_map = {
        "object_id": "Source ID",
        "right_ascension": "RA",
        "declination": "Dec",
        "phz_median": "Ph. redshift",
        "phz_pp_median_stellarmass": "log M★/M☉",
    }
    rename_map[x_col] = x_label
    rename_map[y_col] = y_label

    table_df = sel_df[display_cols].copy().reset_index(drop=True)
    table_df["object_id"] = table_df["object_id"].astype(str)
    table_df = table_df.rename(columns=rename_map)
    st.dataframe(table_df, use_container_width=True, hide_index=True)

    csv_data = table_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="Download table as CSV",
        data=csv_data,
        file_name="cluster_members_selection.csv",
        mime="text/csv",
    )

    st.markdown("### Cutouts")

    css = """
    <style>
    .sel-gallery { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; padding:10px 0; }
    .sel-card { text-align:center; width:180px; }
    .sel-card img { width:170px; height:170px; object-fit:cover; border-radius:6px;
                    border:2px solid #FF4B4B; background:#111; }
    .sel-card .slbl { font-size:10px; color:#aaa; margin-top:2px;
                      overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .sel-card .sbtn { display:inline-block; margin-top:3px; padding:2px 6px;
                      background:#262730; color:#FAFAFA; border-radius:4px;
                      font-size:10px; text-decoration:none; font-family:monospace; }
    .sel-card .sbtn:hover { background:#FF4B4B; }
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

    cards = ""
    for _, row in sel_df.iterrows():
        fname = row.get("jpg_loc_gz_arcsinh_vis_y")
        if not fname or pd.isna(fname):
            cards += f'<div class="sel-card"><div class="slbl">{row["object_id"]} (no image)</div></div>'
            continue
        url = cutout_url(fname)
        esasky = get_esasky_url(row["right_ascension"], row["declination"])
        cards += f"""
        <div class="sel-card">
            <img src="{url}" alt="{row['object_id']}" loading="lazy">
            <div class="slbl" title="{row['object_id']}">{row['object_id']}</div>
            <a class="sbtn" href="{esasky}" target="_blank">{row['right_ascension']:.4f}, {row['declination']:.4f}</a>
        </div>"""

    st.markdown(f'<div class="sel-gallery">{cards}</div>', unsafe_allow_html=True)


main()