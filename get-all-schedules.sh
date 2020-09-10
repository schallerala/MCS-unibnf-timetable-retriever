#!/bin/sh

node dist/get-courses-pages-from-finder.js | \
    # skip header line and make sure it is automn semester
    awk -F, 'NR > 1 && $4 ~ /^A/{print $2}' | \
    xargs -n1 -I{} node dist/get-course-schedule.js {} | awk 'NF' > courses-seminars-all-schedule.csv