export function dateToSlackTs(date: Date):string{
  const ts = date.getTime().toString();
  return ts.slice(0,10) + "." + ts.slice(10) + "000";
}

export function slackTsToDate(slackTs:string):Date{
  const tsParts = slackTs.split(".");
  const ts = tsParts[0] + tsParts[1].slice(0,3);
  return new Date(Number(ts));
}

export function genSlackTsRange(oldestTimestamp?:Date, latestTimestamp?:Date){
  const oldest = oldestTimestamp ? dateToSlackTs(oldestTimestamp) : undefined;
  const latest = latestTimestamp ? dateToSlackTs(latestTimestamp) : undefined;
  return { oldest, latest };
}

export function addYearToSlackTs(slackTs:string, year:number){
  const ts = slackTsToDate(slackTs);
  const addedYears = ts.getFullYear() + year;
  ts.setFullYear(addedYears);
  return dateToSlackTs(ts);
}
export function addMonthToSlackTs(slackTs:string, month:number){
  const ts = slackTsToDate(slackTs);
  const addedMonths = ts.getMonth() + month;
  ts.setMonth(addedMonths);
  return dateToSlackTs(ts);
}
export function addDateToSlackTs(slackTs:string, date:number){
  const ts = slackTsToDate(slackTs);
  const addedDate = ts.getDate() + date;
  ts.setDate(addedDate);
  return dateToSlackTs(ts);
}

export function genSlackTs1secBeforeAndAfter(slackTs:string){
  const [tsSec,tsMsec] = slackTs.split(".");
  const before = (Number(tsSec) - 1) + tsMsec;
  const after = (Number(tsSec) + 1) + tsMsec;
  return {before,after};
}