'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {

    // THIS API REQUIRES PAYMENT TO USE FILTERS :
    // 
    // const response = await api('/tasks?filter=overdue|today');
    api.initialize(activity);
    const response = await api('/tasks');
    if ($.isErrorResponse(activity, response)) return;

    let value = response.body.length;
    const pagination = $.pagination(activity);
    let pagiantedItems = paginateItems(response.body, pagination);

    activity.Response.Data.items = convertResponse(pagiantedItems);
    activity.Response.Data.title = T(activity, 'Active Tasks');
    activity.Response.Data.link = 'https://todoist.com/app';
    activity.Response.Data.linkLabel = T(activity, 'All Tasks');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
        : T(activity, "You have 1 task.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tasks.`);
    }
  } catch (error) {
    $.handleError(activity, error, [403]);
  }
};

//**maps resposne data to items */
function convertResponse(tasks) {
  let items = [];

  // iterate through each issue and extract id, title, etc. into a new array
  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = {
      id: raw.id,
      name: raw.content,
      description: `Priority: ${getTaskPriority(raw.priority)}`,
      date: raw.created,
      link: raw.url,
      raw: raw
    };
    items.push(item);
  }

  return { items };
}

function getTaskPriority(priority) {
  let priorityStr = null;
  if (priority == 1) {
    priorityStr = "Low";
  } else if (priority == 2) {
    priorityStr = "Normal";
  } else if (priority == 3) {
    priorityStr = "High";
  } else {
    priorityStr = "Urgent";
  }
  return priorityStr;
}

function paginateItems(items, pagination) {
  let pagiantedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return pagiantedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) {
      break;
    }
    pagiantedItems.push(items[i]);
  }
  return pagiantedItems;
}

//**filters tasks based on provided daterange */
function filterByDateRange(tasks, daterange) {
  let filteredLeads = [];
  const timeMin = new Date(daterange.startDate).valueOf();
  const timeMax = new Date(daterange.endDate).valueOf();

  for (let i = 0; i < tasks.length; i++) {
    let createTime = new Date(tasks[i].created).valueOf();
    if (createTime> timeMin && createTime < timeMax) {
      filteredLeads.push(tasks[i]);
    }
  }

  return filteredLeads;
}