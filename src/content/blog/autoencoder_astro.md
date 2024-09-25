---
author: Pedro Mas
pubDatetime: 2024-09-25T02:02:36+0000
title: Using Grid Search For Autoencoder Hyperparameter Tuning
slug: autoencoder
featured: false
ogImage: ""
tags:
  - Data
description: AstroPaper with the enhancements of Astro v2. Type-safe markdown contents, bug fixes and better dev experience etc.
---

Finding the optimal combination of hyperparameters can be a tedious task when building a deep learning model. In this context, the grid search tuning technique is one of the most useful for hyperparameter optimization, and is accessible through the ``GridSearchCV`` class ([documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html)) of the ``scikit-learn`` package. Thanks to this technique, the user can evaluate the model for each hyperparameter combination throughout the desired parameter space.

In this brief tutorial we will build a deep autoencoder to reconstruct the images provided by the well known [MNIST](http://yann.lecun.com/exdb/mnist/) database of handwritten digits, which is available through the ``tensorflow.keras.datasets`` module. Autoencoders are a specific type of neural networks that consist of 2 components: the encoder and the decoder.

![something](@assets/images/autoencoder.jpg)

First, the encoder finds an efficient compressed representation of the input data, and then the decoder uses this lower-dimensional representation to reconstruct the information. You can find a detailed explanation of autoencoders [here](https://towardsdatascience.com/applied-deep-learning-part-3-autoencoders-1c083af4d798). Using the grid search tuning technique, we will build an autoencoder and use the optimal combination of hyperparameters to reconstruct the original images and explore the compressed representations found by the encoder. 

![something](@assets/images/ac_results.jpg)

You can download the tutorial from Github [![Jupyter Book Badge](https://jupyterbook.org/badge.svg)](https://github.com/pedromasb/tutorials/blob/main/notebooks/gridsearch_autoencoder.ipynb) or follow it on Google Colab.

