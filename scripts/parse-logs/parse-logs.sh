set1=./all-services.txt
set2=./out/used-services.txt

find ./logs -type f -exec awk  -f parse-logs.awk {} + > ./out/usage.txt

awk '{print $1}' ./out/usage.txt > $set2

# https://unix.stackexchange.com/questions/11343/linux-tools-to-treat-files-as-sets-and-perform-set-operations-on-them

sort $set1 $set2 | uniq -u
