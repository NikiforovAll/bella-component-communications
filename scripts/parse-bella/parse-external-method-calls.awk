
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
