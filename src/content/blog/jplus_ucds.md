---
authors:
  - { name: "Pedro Mas-Buitrago", orcid: "0000-0001-8055-7949" }
journal: "A&A"
volume: "666"
isPaper: true
doi: "10.1051/0004-6361/202243895"
arxiv: "arXiv:2208.09377"

pubDatetime: 2022-10-19T00:00:00
title: "J-PLUS: Discovery and characterisation of ultracool dwarfs using Virtual Observatory tools II. Second data release and machine learning methodology"
slug: jplus-ucds
featured: true
draft: false
tags:
  - Astro
  - Virtual Observatory
  - Machine Learning
  - Low-mass
description: Lead author of a journal article published in Astronomy & Astrophysics
---

In this work, published in Astronomy & Astrophysics, we use data from the J-PLUS archive to consolidate a search methodology for ultracool dwarfs in large multi-filter photometric surveys, which will be key for the identification of ultracool dwarfs in upcoming surveys such as J-PAS and Euclid. We also develop a Python algorithm capable of detecting excess in the J-PLUS filters corresponding to the Halpha and CaII H and K emission lines, revealing the potential of multi-filter photometric surveys to detect flaring M dwarfs.

&nbsp;

![image](@assets/images/dist_teff_ext.png)

*Distance vs. effective temperature diagram for previously reported (blue) and new (yellow) candidate UCDs with good parallax
conditions. The vertical dashed line indicates the lower limit of effective temperature for M-type dwarfs (2359 K) according to Pecaut & Mamajek (2013).*


### Abstract
>>
Context. Ultracool dwarfs (UCDs) comprise the lowest mass members of the stellar population and brown dwarfs, from M7 V to cooler objects with L, T, and Y spectral types. Most of them have been discovered using wide-field imaging surveys, for which the Virtual Observatory (VO) has proven to be of great utility.
>>
Aims. We aim to perform a search for UCDs in the entire Javalambre Photometric Local Universe Survey (J-PLUS) second data release (2176 deg2) following a VO methodology. We also explore the ability to reproduce this search with a purely machine learning (ML)-based methodology that relies solely on J-PLUS photometry.
>>
Methods. We followed three different approaches based on parallaxes, proper motions, and colours, respectively, using the VOSA tool to estimate the effective temperatures and complement J-PLUS photometry with other catalogues in the optical and infrared. For the ML methodology, we built a two-step method based on principal component analysis and support vector machine algorithms.
>>
Results. We identified a total of 7827 new candidate UCDs, which represents an increase of about 135% in the number of UCDs reported in the sky coverage of the J-PLUS second data release. Among the candidate UCDs, we found 122 possible unresolved binary systems, 78 wide multiple systems, and 48 objects with a high Bayesian probability of belonging to a young association. We also identified four objects with strong excess in the filter corresponding to the Ca ii H and K emission lines and four other objects with excess emission in the Halpha filter. Follow-up spectroscopic observations of two of them indicate they are normal late-M dwarfs. With the ML approach, we obtained a recall score of 92% and 91% in the 20 x 20 deg2 regions used for testing and blind testing, respectively.
>>
Conclusions. We consolidated the proposed search methodology for UCDs, which will be used in deeper and larger upcoming surveys such as J-PAS and Euclid. We concluded that the ML methodology is more efficient in the sense that it allows for a larger number of true negatives to be discarded prior to analysis with VOSA, although it is more photometrically restrictive.
