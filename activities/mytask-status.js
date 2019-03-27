'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    //const response = await api('/tasks?filter=overdue|today');
    const response = await api('/tasks');

    if (Activity.isErrorResponse(response)) return;

    let taskStatus = {
      title: T('Active Tasks'),
      link: 'https://todoist.com/app',
      linkLabel: T('All Tasks')
    };

    let taskCount = response.body.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: taskCount > 1 ? T("You have {0} tasks.", taskCount) : T("You have 1 task."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(`You have no tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    Activity.handleError(error, [403]);
  }
};
