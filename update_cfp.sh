#!/bin/bash

node wiki_cfp_main.js
node add_core_conf_2_wiki-cfp.js
git add wiki-cfp.json
git commit -m update
git push
