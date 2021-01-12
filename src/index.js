const data = require('./data.json');
const _ = require('underscore');
const { locationDistance } = require('./utils');

// lambda-like handler function
module.exports.handler = async event => {
  const { httpMethod, path, headers, queryStringParameters } = event;
  console.log(event);
  const response = defaultResponse();
  const routes = [
    '/zipcode'
  ];

  // Get Request Type
  switch (httpMethod) {
    case 'POST':
      if (
        !headers 
        || !headers.hasOwnProperty('content-type') 
        || headers['content-type'].indexOf('application/json') !== 0) {
        throw Error('Invalid request type');
      }
      if (!routes.includes(path)) {
        response.statusCode = 404;
      } else { 
        response.body = JSON.stringify({
          "status": "ok"
        });
      }
    break;
    case 'GET':
      if (!routes.includes(path)) {
        response.statusCode = 404;
      } else {
        const result = buildResults(queryStringParameters || {});
        response.body = JSON.stringify(result);
      }
    break;
    default:
      response.statusCode = 405;
    break;
  }

  return response;
};

// Build response results
function buildResults(query) {
  const { zipCode, cityName, location, distance, orderBy, ...filters } = query;
  let results = data;

  if (zipCode) {
    const regZip = new RegExp(zipCode, 'g');
    results = _.filter(results, r => r.zip.search(regZip) !== -1);
  }
  if (cityName) {
    const regCity = new RegExp(cityName, 'gi');
    results = _.filter(results, r => r.primary_city.search(regCity) !== -1);
  }
  if (location && distance) {
    const [latitude, longitude] = location.split(";");
    results = _.filter(results, r => locationDistance(latitude, longitude, r.latitude, r.longitude, 'K') <= distance);
  }

  if (Object.keys(filters).length > 0) {
    results = _.where(results, filters);
  }

  if (orderBy) {
    const [field, order] = orderBy.split(":");
    results = _.sortBy(results, field);
    if (order && order == "desc") {
      results.reverse();
    }
  }

  return results;
}

// Build default response
function defaultResponse() {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: null
  }
}
