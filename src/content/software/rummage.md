---
author: Pedro Mas
pubDatetime: 2026-09-16T00:00:00
title: "Rummage: semantic search for your Chrome bookmarks"
featured: false
draft: false
description: Chrome extension
tags:
  - software
  - Chrome extension
website: "https://get-rummage.com/"
---

Rummage is a Chrome extension that makes the bookmarks you already have searchable by
meaning, not just by keywords. There is no new app and no new habit of saving things: it
indexes your existing Chrome bookmarks and finds them even when you don't remember the
exact title. Searching for *telescope conference* finds a page called *dotAstronomy 13*.

<img src="/images/rummage-popup.png" alt="The Rummage popup: a search for 'python visualization' listing matching bookmarks, each with a similarity score, some badged 'title only'." width="380" />

## How it works

You choose which bookmark folders Rummage may read, and anything left unchecked is never
opened. In the background, newest bookmarks first, Rummage reads the article text behind
each bookmark and turns it into an embedding: a numerical representation of what the page
is about. A search is embedded the same way, and your bookmarks are ranked by how close in
meaning they are to it.

The index lives in your browser. There is no account and no sync server, and no copy of
your bookmarks is kept anywhere else. To build the index, each page's title, folder and the
start of its text are sent through Rummage's server to an OpenAI model; the result comes
back to your browser, and nothing is stored on the server.

Pages behind a login or a paywall, and sites that build their content with JavaScript,
can't be read, because Rummage never uses your logged-in sessions. Those bookmarks are
indexed by title and folder only, and marked *title only* in the results.

## Free and paid

The free version is the whole product, not a trial: the same search, with no time limit,
for your 50 most recent bookmarks. A one-time payment of $34.99 lifts that limit to your
whole library. There is no subscription.

Get it at [get-rummage.com](https://get-rummage.com/).
