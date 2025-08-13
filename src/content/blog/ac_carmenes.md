---
authors:
  - { name: "Mas-Buitrago", orcid: "0000-0001-8055-7949" }
journal: "A&A"
volume: "687"
isPaper: true
doi: "10.1051/0004-6361/202449865"
arxiv: "2405.08703"

pubDatetime: 2024-07-15T00:00:00
title: Using autoencoders and deep transfer learning to determine the stellar parameters of 286 CARMENES M dwarfs
slug: autoencoder-carmenes
featured: true
draft: false
tags:
  - Astro
  - Deep Learning
  - Low-mass
description: Lead author of a journal article published in Astronomy & Astrophysics
bibtex: |
  @ARTICLE{2024A&A...687A.205M,
        author = {{Mas-Buitrago}, P. and {Gonz{\'a}lez-Marcos}, A. and {Solano}, E. and {Passegger}, V.~M. and {Cort{\'e}s-Contreras}, M. and {Ordieres-Mer{\'e}}, J. and {Bello-Garc{\'\i}a}, A. and {Caballero}, J.~A. and {Schweitzer}, A. and {Tabernero}, H.~M. and {Montes}, D. and {Cifuentes}, C.},
          title = "{Using autoencoders and deep transfer learning to determine the stellar parameters of 286 CARMENES M dwarfs}",
        journal = {\aap},
      keywords = {methods: data analysis, techniques: spectroscopic, stars: fundamental parameters, stars: late-type, stars: low-mass, Astrophysics - Solar and Stellar Astrophysics, Astrophysics - Earth and Planetary Astrophysics, Astrophysics - Instrumentation and Methods for Astrophysics, Computer Science - Machine Learning},
          year = 2024,
          month = jul,
        volume = {687},
            eid = {A205},
          pages = {A205},
            doi = {10.1051/0004-6361/202449865},
  archivePrefix = {arXiv},
        eprint = {2405.08703},
  primaryClass = {astro-ph.SR},
        adsurl = {https://ui.adsabs.harvard.edu/abs/2024A&A...687A.205M},
        adsnote = {Provided by the SAO/NASA Astrophysics Data System}
    }
---

In this work, published in Astronomy & Astrophysics, we develop an innovative deep transfer learning methodology to determine stellar parameters in M dwarfs from synthetic spectra. Using of deep autoencoder neural networks, combined with a fine-tuning transfer learning approach, we project the data into a new low-dimensional feature space in which no significant differences are observed between the synthetic and the real data, solving the main limitations of previous works.

&nbsp;

![image](@assets/images/lbol_teff_thick.png)

*Hertzsprung-Russell diagram of the stellar parameters derived with our methodology. The dots are colour-coded according to the estimated metallicity. The size of the dots is proportional to the estimated projected rotational velocity. Triangles represent stars identified as Hα active, and empty stars depict members of the thick disc Galactic population.*

### Abstract
>>
Context. Deep learning (DL) techniques are a promising approach among the set of methods used in the ever-challenging determination of stellar parameters in M dwarfs. In this context, transfer learning could play an important role in mitigating uncertainties in the results due to the synthetic gap (i.e. difference in feature distributions between observed and synthetic data).
>>
Aims. We propose a feature-based deep transfer learning (DTL) approach based on autoencoders to determine stellar parameters from high-resolution spectra. Using this methodology, we provide new estimations for the effective temperature, surface gravity, metallicity, and projected rotational velocity for 286 M dwarfs observed by the CARMENES survey.
>>
Methods. Using autoencoder architectures, we projected synthetic PHOENIX-ACES spectra and observed CARMENES spectra onto a new feature space of lower dimensionality in which the differences between the two domains are reduced. We used this low-dimensional new feature space as input for a convolutional neural network to obtain the stellar parameter determinations.
>>
Results. We performed an extensive analysis of our estimated stellar parameters, ranging from 3050 to 4300 K, 4.7 to 5.1 dex, and −0.53 to 0.25 dex for Teff, log 𝑔, and [Fe/H], respectively. Our results are broadly consistent with those of recent studies using CARMENES data, with a systematic deviation in our Teff scale towards hotter values for estimations above 3750 K. Furthermore, our methodology mitigates the deviations in metallicity found in previous DL techniques due to the synthetic gap.
>>
Conclusions. We consolidated a DTL-based methodology to determine stellar parameters in M dwarfs from synthetic spectra, with no need for high-quality measurements involved in the knowledge transfer. These results suggest the great potential of DTL to mitigate the differences in feature distributions between the observations and the PHOENIX-ACES spectra.
