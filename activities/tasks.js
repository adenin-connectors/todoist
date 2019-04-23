'use strict';
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    //const response = await api('/tasks?filter=overdue|today');
    api.initialize(activity);
    const response = await api('/tasks');

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    $.handleError(activity, error, [403]);
  }
};

//**maps resposne data to items */
function convertResponse(response) {
  let items = [];
  let tasks = response.body;

  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = {
      id: raw.id,
      priority: raw.priority,
      description: raw.content,
      link: raw.url,
      raw: raw
    };
    items.push(item);
  }

  return { items: items };
}