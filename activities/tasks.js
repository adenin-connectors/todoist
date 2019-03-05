'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);
    //const response = await api('/tasks?filter=overdue|today');
    const response = await api('/tasks');

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};

//**maps resposne data to items */
function convertResponse(response) {
  let items = [];
  let tasks = response.body;

  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = { id: raw.id, priority: raw.priority, description: raw.content, link: raw.url, raw: raw }
    items.push(item);
  }

  return { items: items };
}