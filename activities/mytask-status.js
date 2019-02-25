'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    //const response = await api('/tasks?filter=overdue|today');
    const response = await api('/tasks');

    let taskStatus = {
      title: 'Active Tasks',
      url: 'https://todoist.com/app',
      urlLabel: 'All tasks',
    };

    let taskCount = response.body.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: `You have ${taskCount > 1 ? taskCount + " tasks" : taskCount + " tasks"} due today`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      }
    } else {
      taskStatus = {
        ...taskStatus,
        description: `You have no tasks due today`,
        actionable: false
      }
    }

    activity.Response.Data = taskStatus;

  } catch (error) {
    handleError(error, activity);
  }
};
