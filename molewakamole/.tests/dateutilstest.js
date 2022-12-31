const DateUtils = require('../dateutils.js');

let n = DateUtils.now();

console.log(DateUtils.format(n));
console.log(DateUtils.formatLocal(n));

let utc = DateUtils.format(n);
let local = DateUtils.formatLocal(n);

let dateUtc = DateUtils.fromUTC(utc);
let dateLocal = DateUtils.fromLocal(local);

console.log("These should be the same time:")
console.log(DateUtils.formatLocal(n));
console.log(DateUtils.formatLocal(dateUtc));
console.log(DateUtils.formatLocal(dateLocal));

console.log("These should be the same time:")
console.log(DateUtils.format(n));
console.log(DateUtils.format(dateUtc));
console.log(DateUtils.format(dateLocal));

console.log("---------------------");
console.log(DateUtils.formatLocal(n, "dd-MM"))