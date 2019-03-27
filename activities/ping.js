'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api('/projects');

    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    Activity.handleError(error, [403]);
    activity.Response.Data.success = false;
  }
};
