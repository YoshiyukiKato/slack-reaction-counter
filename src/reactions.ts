import {WebClient, WebAPICallResult} from "@slack/web-api";
import {dateToSlackTs} from "./timestamp";

export async function summaryConversationReactions(token: string, conversationId: string, from: Date, to: Date){
  const web = new WebClient(token);
  const reactions = await getReactions(web, conversationId, from, to);
  const {reactionUserMap,userReactionMap} = countReactions(reactions);
  const message = {
    channel: conversationId,
    text: `年の瀬だし2019年の <#${conversationId}> のスタンプ事情を振り返る`,
    attachments: [
      renderUsedReactions(reactionUserMap), renderReactionsUsedByReactedPeople(userReactionMap)
    ]
  };
  web.chat.postMessage(message);
}

async function getReactions(web: WebClient, conversationId: string, from: Date, to: Date){
  const oldest = dateToSlackTs(from);
  const latest = dateToSlackTs(to);
  const reactions = [];
  
  for await (const page of <AsyncIterable<WebAPICallResult>><any>web.paginate("conversations.history", { channel: conversationId, oldest, latest })){
    for(const message of <any[]>page.messages){
      if(message.reactions){
        for(const reaction of message.reactions){
          reactions.push(reaction);
        }
      }
      if(message.replies){
        for(const reply of message.replies){
          if(reply.reactions){
            for(const reaction of reply.reactions){
              reactions.push(reaction);
            }
          }
        }
      }
    }
  }
  return reactions;
}

function countReactions(reactions:any[]){
  const reactionUserMap:TNestedMap = {};
  const userReactionMap:TNestedMap = {};
  for(const reaction of reactions){
    reactionUserMap[reaction.name] = reactionUserMap[reaction.name] || {};
    for(const user of reaction.users){
      reactionUserMap[reaction.name][user] = (reactionUserMap[reaction.name][user] || 0) + 1;
      userReactionMap[user] = userReactionMap[user] || {};
      userReactionMap[user][reaction.name] = (userReactionMap[user][reaction.name] || 0) + 1;
    }
  }
  return {userReactionMap, reactionUserMap};
}

function renderUsedReactions(reactionUserMap:TNestedMap){
  const summary = summarizeNestedMap(reactionUserMap);
  const text = Object.entries<number>(summary)
    .sort((a:[string, number], b:[string,number]) => {
      return a[1] < b[1] ? 1 : -1;
    })
    .slice(0, 10)
    .map(([key, val]) => `:${key}: ${val}回`)
    .join("\n");
  
  return {
    color: "gray",
    title: "よく使われたスタンプ",
    text
  }
}

function renderReactedPeople(userReactionMap:TNestedMap){
  const summary = summarizeNestedMap(userReactionMap);
  const text = Object.entries<number>(summary)
    .sort((a:[string, number], b:[string,number]) => {
      return a[1] < b[1] ? 1 : -1;
    })
    .slice(0, 10)
    .map(([key, val]) => `<@${key}> ${val}回`)
    .join("\n");
  
  return {
    color: "gray",
    title: "よくスタンプを押した人",
    text
  }
}

function renderReactionsUsedByReactedPeople(userReactionMap:TNestedMap){
  const summary = summarizeNestedMap(userReactionMap);
  const text = Object.entries<number>(summary)
    .sort((a:[string, number], b:[string,number]) => {
      return a[1] < b[1] ? 1 : -1;
    })
    .slice(0, 10)
    .map(([user, number]) => {
      const stamps = Object.entries<number>(userReactionMap[user])
        .sort((a:[string, number], b:[string,number]) => {
          return a[1] < b[1] ? 1 : -1;
        })
        .slice(0, 10)
        .map(([reaction]) => `:${reaction}:`)
        .join("");
      return `<@${user}> ${number}回　よく使うスタンプ: ${stamps}`;
    })
    .join("\n");
  
  return {
    color: "gray",
    title: "よくスタンプを押した人",
    text
  }
}

type TNestedMap = {[key:string]:{[key:string]:number}};
function summarizeNestedMap(nestedMap:TNestedMap){
  return Object.entries<{[key:string]:number}>(nestedMap).reduce<{[key:string]:number}>((sumMap, [key, itemMap]) => {
    sumMap[key] = Object.values(itemMap).reduce<number>((acc, val) => acc + val, 0);
    return sumMap;
  }, {});
}