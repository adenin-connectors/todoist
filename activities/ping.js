'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/projects');

    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    cfActivity.handleError(activity, error, [403]);
    activity.Response.Data.success = false;
  }
};
