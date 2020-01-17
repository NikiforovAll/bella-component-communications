#!/bin/sh

# TODO: SKIP COMMENTS, possible source of errors
# zebraProjectPath="C:/Nikiforov/dev/Zebra/src/Domain/components/GeneralLedger"
# zebraProjectPath="C:/Nikiforov/dev/Zebra/src/Domain/components/MailStorage"
zebraProjectPath="C:/Nikiforov/dev/nuts-bella/src/Domain/components"


componentServices='build/component-services.json'
methodCalls="build/method-calls.json"

find $zebraProjectPath -name "Services.bs" -type f -exec awk '
    function join(array, start, end, sep,  result, i)
    {
        if (sep == "")
        sep = " "
        else if (sep == SUBSEP) # magic value
        sep = ""
        result = array[start]
        for (i = start + 1; i <= end; i++)
            result = result sep array[i]
        return result
    }
    BEGIN {
        numberOfComponents=0;
    }
    BEGINFILE  {

        numberOfComponents++;
        num_tokens = split(FILENAME, filePathTokens, "/")
        componentName = filePathTokens[num_tokens-2];
        currentComponentString = "{\"name\": \"" componentName "\","
    }
    /hosted service/ && !/^\/\// {
        hosted[$3] = $5;
    }
    /external service/ && !/^\/\// {
        external[$3] = $5;
    }
    ENDFILE {
        hostedCount = 1;
        externalCount = 1;
        # for (key in hosted) {
        #     print "hosted-" key
        # }
        # for (key in external) {
        #     print "external-" key
        # }
        for (key in hosted) {
            tokens[hostedCount++] = "{\"name\": \"" key "\", " "\"on\": \"" hosted[key] "\"}";
        }
        for (key in external) {
            tokens2[externalCount++] = "{\"name\": \"" key "\", " "\"on\": \"" external[key] "\"}";
        }
        # why this works? Some problems with actual evaluation of tokens<i>
        for (key in tokens) {
            tmp="token1-" key
        }
        for (key in tokens2) {
            tmp="token2-" key
        }

        if ( length(tokens) > 0 ) {
            currentComponentString = currentComponentString "\"services\": [" join(tokens, 1, length(tokens), ", ") "],"
            delete hosted
            delete tokens
        }
        else {
            currentComponentString = currentComponentString "\"services\": [],"
        }

        if ( length(tokens2) > 0) {
            currentComponentString = currentComponentString "\"consumes\": [" join(tokens2, 1, length(tokens2), ", ") "]}"
            delete external
            delete tokens2
        } else {
            currentComponentString = currentComponentString "\"consumes\": []}"
        }
        components[numberOfComponents] = currentComponentString
    }
    END {
        localComponentCount = 1;
        printf "%s", "{\"nodes\": ["
        for (key in components) {
            printf "%s", components[key];
            if(localComponentCount != length(components))
            {
                printf "%s", ", "
            }
            localComponentCount++;
        }
        printf "%s", "]}"
    }
' {} + > $componentServices

count=0
declare -A components
result="{\"nodes\": ["
echo $result | tee $methodCalls
jq -r '.nodes| keys[]' $componentServices | while read key ; do
    selector='.nodes['
    selector+=$count
    selector+=']'
    componentName=$(cat $componentServices | jq -r "$selector.name")
    # consumed_services=$(jq -c "$selector.consumes[].name" $componentServices)
    consumed_services=$(jq -r "$selector.consumes[].name" $componentServices | awk '{
        $0=$0
        print;
    }' ORS=',')
    count=$((count + 1))
    # echo $componentName
    # echo $consumed_services
    find "$zebraProjectPath/$componentName" -name "*.bs" -type f -exec awk -v cmpPayload="$consumed_services" -v cmpName="$componentName" '
    function ltrim(s) { sub(/^[ \t\r\n]+/, "", s); return s }
    function rtrim(s) { sub(/[ \t\r\n]+$/, "", s); return s }
    function trim(s) { return rtrim(ltrim(s)); }
    function push(A,B) { A[length(A)+1] = B }
    function enqoute(s) { return "\"" s "\""}
    function join(array, start, end, sep,  result, i)
    {
        if (sep == "")
        sep = " "
        else if (sep == SUBSEP) # magic value
        sep = ""
        result = array[start]
        for (i = start + 1; i <= end; i++)
            result = result sep array[i]
        return result
    }
        BEGIN {
            split(cmpPayload, consumed_services_tmp, ",")

            for (i in consumed_services_tmp)
            {
                consumed_services[trim(consumed_services_tmp[i])] = ""
            }
            # for (i in consumed_services)
            # {
            #     print i " - " consumed_services[i]
            # }
            print "{\"componentName\": " enqoute(cmpName) ", \"references\": ["
        }
        /[A-Za-z0-9]+(\.[A-Za-z0-9]+)?/ && !/^\s*\/\// {
            if(match($0, /[A-Za-z0-9]*\.[A-Za-z0-9]*/ ))
            {
                # print FILENAME " " FNR " " substr($0, RSTART, RLENGTH)
                matched_str=substr($0, RSTART, RLENGTH)
                len=split(matched_str, match_tokens, ".")
                service_name=trim(match_tokens[len-1])
                method_name=trim(match_tokens[len])
                if(length(service_name) != 0 && (service_name in consumed_services))
                {
                    gsub(/"/,"\\\"", $0)
                    serviceInfo["service_name"] = enqoute(service_name)
                    serviceInfo["context"] = enqoute($0)
                    serviceInfo["line"]= enqoute(FNR)
                    serviceInfo["file"]= enqoute(FILENAME)
                    serviceInfo["method_name"] = enqoute(method_name)

                    serviceInfoTokensCnt=1
                    for(info_token in serviceInfo)
                    {
                        serviceInfoTokens[serviceInfoTokensCnt++] =  enqoute(info_token) ": " serviceInfo[info_token]
                    }
                    serviceInfoStr = "{" join(serviceInfoTokens, 1, length(serviceInfoTokens), ",") "}"
                    # print serviceInfoStr
                    delete serviceInfoTokens
                    if(typeof(usages) =="array"){
                        push(usages, serviceInfoStr)
                    }else
                    {
                        usages[1] = serviceInfoStr
                    }
                }
            }
        }
        END {

            # for(usage in usages)
            # {
            #     print usages[usage]
            # }

            print join(usages, 1, length(usages), ",")
            print "]}"
        }
    ' {} + | tee -a $methodCalls
    echo "," | tee -a $methodCalls
done

# for cmp in "${components[@]}"; do
#     echo $cmp | tee -a $methodCalls
# done

echo "$payload ]}" | tee -a $methodCalls
