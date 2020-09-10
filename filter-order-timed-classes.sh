#!/bin/sh

# Filter out on appointment classes
grep -v "On Appointment" courses-seminars-all-schedule.csv | \
    # Add 3 columns as prefix, to order by day of the week index and also extract time to have its own column
    awk -F, -v dayOfWeekColIndex=9 -v timeColIndex=10 'BEGIN{ d["Mon"]=i++;d["Tue"]=i++;d["Wed"]=i++;d["Thu"]=i++;d["Fri"]=i++;d["Sat"]=i++;d["Sun"]=i++;} {dayOfWeek=substr($dayOfWeekColIndex, 2, 3); dayOfWeekIndex=d[dayOfWeek]; timeline=substr($timeColIndex, 2, length($timeColIndex) - 2); print dayOfWeekIndex "," dayOfWeek "," timeline "," $0}' | \
    # Sort everything and redirect
    sort > course_schedules.csv