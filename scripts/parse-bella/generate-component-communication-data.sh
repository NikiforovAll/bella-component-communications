#!/bin/sh

# TODO: SKIP COMMENTS, possible source of errors
# TODO: fix issue with trailing comma in generated files
# zebraProjectPath="C:/Nikiforov/dev/Zebra/src/Domain/components/GeneralLedger"
# zebraProjectPath="C:/Nikiforov/dev/Zebra/src/Domain/Components/DunningComponent"
zebraProjectPath="C:/Nikiforov/dev/nuts-bella/src/Domain/components"
# zebraProjectPath="C:/Nikiforov/dev/small-bella/Domain/Components"

# TODO: MAJOR: script is broken at the moment
componentServices='.\\build\\component-services.json'
methodCalls='./build/method-calls.json'

find $zebraProjectPath -name "Services.bs" -type f -exec awk  -f parse-service.awk {} + > $componentServices

# jq '.nodes | keys[]' $componentServices

count=0
declare -A components
result="{\"nodes\": ["
echo $result | tee $methodCalls
jq -r '.nodes | keys[]' $componentServices | while read key ; do
    selector='.nodes['
    selector+=$count
    selector+=']'
    componentName=$(cat "$componentServices" | jq -r "$selector.name")
    # consumed_services=$(jq -c "$selector.consumes[].name" $componentServices)
    consumed_services=$(jq -r "$selector.consumes[].name" "$componentServices" | awk '{
        $0=$0
        print;
    }' ORS=',')
    count=$((count + 1))
    # echo $componentName
    # echo $consumed_services
    find "$zebraProjectPath/$componentName" -name "*.bs" -type f -exec awk -f parse-external-method-calls.awk \
    -v cmpPayload="$consumed_services" \
    -v cmpName="$componentName" '' {} + | tee -a $methodCalls
    echo "," | tee -a $methodCalls
done

for cmp in "${components[@]}"; do
    echo $cmp | tee -a $methodCalls
done

# sed '$d' "$methodCalls" > "$methodCalls"
echo "$payload ]}" | tee -a $methodCalls


