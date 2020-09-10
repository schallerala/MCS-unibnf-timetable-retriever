# Master Computer Sciences - Timetable retriever
### BeNeFri

To ease the selection of classes, create a few shell and TypeScript scripts
to retrieve the classes present on https://mcs.unibnf.ch/.


## How it works
1. Compile with
```shell
tsc -b tsconfig.json -w
```
This will output the TypeScript files in the `dist` folder.

2. Run shell script `get-all-schedules.sh` to retrive a `csv` file of most of the details of the
classes using the course finder and the classes' own pages.
    * To change the semester, you have to edit the condition of awk to filter out classes from the finder

3. Run shell script `filter-order-timed-classes.sh` to remove appointment classes and order them through the week.


## Formatted result in GSheet
If you are lazy, just copy the resulting GSheet:
https://docs.google.com/spreadsheets/d/17gdDsrZl7h_Bf29LpBd1fvECTD1CCqY_myhuMEtN5t0/edit?usp=sharing