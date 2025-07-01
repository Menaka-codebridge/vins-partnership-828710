import functionCall from "./promiseSectionSubSectionFunctionCall";

const apiCalls = [
  { apiPayload: "", name: "", response_text: "" },
  { apiPayload: "", name: "", response_text: "" },
];

const promises = [];

for (call in apiCalls) {
  promises.push(functionCall(call.apiPayload));
}

const promiseArray = new Promise.all(promises);
