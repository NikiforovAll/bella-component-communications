
/DomainBellaNS\.API\.BillingEngine\.BillingEngine_Impl/ {
  if ($3 ~ /\[[0-9]*\]/){
    # $9 - is method name
    calls[$9]++;
  }
}
/DomainBellaNS\.API\.BillingEngineAsync\.BillingEngineAsync_Impl/ {
  if ($3 ~ /\[.*\]/){
    # $9 - is method name
    calls[$9]++;
  }
}
END {
  for (invoc in calls) printf("%s %s\n", invoc, calls[invoc])
}
