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

    let tasks = convertResponse(response.body);

    let daterange = $.dateRange(activity);
    tasks = filterByDateRange(tasks, daterange);

    tasks.sort((a, b) => {
      return new Date(b.date) - new Date(a.date); //descending
    });

    let value = tasks.length;
    let dateToAssign = tasks.length > 0 ? tasks[0].date : null;
    const pagination = $.pagination(activity);
    tasks = paginateItems(tasks, pagination);


    activity.Response.Data.items = tasks;

    // exclude status if page > 1
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'Active Tasks');
      activity.Response.Data.link = 'https://todoist.com/app';
      activity.Response.Data.linkLabel = T(activity, 'All Tasks');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.date = dateToAssign;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
          : T(activity, "You have 1 task.");
      } else {
        activity.Response.Data.description = T(activity, `You have no tasks.`);
      }
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
      date: new Date(raw.created).toISOString(),
      link: raw.url,
      raw: raw
    };
    items.push(item);
  }

  return items;
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
  const timeMin = Date.parse(daterange.startDate);
  const timeMax = Date.parse(daterange.endDate);

  for (let i = 0; i < tasks.length; i++) {
    let createTime = Date.parse(tasks[i].date);
    if (createTime > timeMin && createTime < timeMax) {
      filteredLeads.push(tasks[i]);
    }
  }

  return filteredLeads;
}