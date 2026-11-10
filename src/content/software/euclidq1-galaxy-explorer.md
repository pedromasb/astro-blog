---
author: Pedro Mas
pubDatetime: 2026-11-09T00:00:00
title: "Euclid Q1 Galaxy Explorer: morphology and physical properties of cluster members"
featured: true
draft: false
description: Streamlit web application
tags:
  - software
  - Euclid
repo: "https://github.com/pedromasb/euclidQ1-galaxy-explorer"
app: "/euclidq1-galaxy-explorer/manifest.json"
---

The Euclid Q1 Galaxy Explorer is an interactive tool for inspecting galaxy cluster members discovered in [Mas-Buitrago et al. 2026](/posts/euclid-morph/), combining [Zoobot](https://github.com/mwalmsley/zoobot) visual morphology predictions with physical properties measured by the Euclid mission.

The sources displayed can be filtered on physical properties (photometric redshift, stellar mass, cluster-centric distance and local projected density) and on the Zoobot morphology predicted fractions. The **Scatter Plot** page puts any two of those morphology columns on the axes and lets you lasso or box-select galaxies to inspect them individually, and each galaxy's coordinates open directly in ESASky.

As with the rest of the tools here, the app below runs entirely inside your
browser — the catalogue is loaded and every plot is computed on your own
machine, and nothing is sent anywhere.
