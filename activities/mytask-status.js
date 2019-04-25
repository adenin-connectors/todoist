'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    //const response = await api('/tasks?filter=overdue|today');
    api.initialize(activity);
    const response = await api('/tasks');

    if ($.isErrorResponse(activity, response)) return;

    let taskStatus = {
      title: T(activity, 'Active Tasks'),
      link: 'https://todoist.com/app',
      linkLabel: T(activity, 'All Tasks')
    };

    let taskCount = response.body.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: taskCount > 1 ? T(activity, "You have {0} tasks.", taskCount) : T(activity, "You have 1 task."),
        color: 'blue',
        value: taskCount,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(taskCount, `You have no tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    $.handleError(activity, error, [403]);
  }
};
