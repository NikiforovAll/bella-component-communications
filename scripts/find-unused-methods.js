let serviceMethods = require("./service-methods.json");
const methodCalls = require("./method-calls.json");

let methodsTotal = 0;
let methodsNotUsed = 0;
serviceMethods.forEach(s => {
  s.methods.forEach(m => {
    m.methodName = m.signature.slice(0, m.signature.indexOf("(")).trim();
    methodsTotal++;
  });
});

let calls = methodCalls.nodes
  .map(function(p) {
    return p.references;
  })
  .reduce(function(a, b) {
    return a.concat(b);
  })
  .map(m => m["method_name"]);

let res = serviceMethods
  .map(s => ({
    service: s.service,
    notUsedMethods: s.methods.filter(m => notUsedMethod(m.methodName, calls))
  }))
  .filter(s =>  {let eval = s.notUsedMethods.length > 0; if(eval){methodsNotUsed++;} return eval});

function notUsedMethod(methodName, calls) {
  return !calls.includes(methodName);
}

res.methodsTotal = methodsTotal;
res.methodsNotUsed = methodsNotUsed;
console.log(JSON.stringify({res, methodsTotal, methodsNotUsed}));
