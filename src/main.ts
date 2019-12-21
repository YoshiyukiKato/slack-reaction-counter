import express from "express";
import {createEventAdapter} from "@slack/events-api";
import {summaryConversationReactions} from "./reactions";

const DATE20190101 = new Date("2019-01-01 00:00:00 GMT+0900");
const DATE20191231 = new Date("2019-12-31 23:59:59 GMT+0900");
const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN || "";
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || "";

const app = express();
const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET);
slackEvents.on("app_mention", async(event:any) => {
  try {
    await summaryConversationReactions(SLACK_ACCESS_TOKEN, event.channel, DATE20190101, DATE20191231);
  } catch(err){
    console.error(err);
  }
});
app.use("/events", slackEvents.expressMiddleware());
app.listen(process.env.PORT || 3000);