/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

// const jsdom = require('jsdom');
import * as jsdom from 'jsdom'
const { JSDOM } = jsdom;
// const abcjs = require('abcjs');
import abcjs from 'abcjs'
global.navigator = {
  userAgent: "node.js"
};

export const lambdaHandler = async (event, context) => {

    let abcNotation;
    try {
      const data = JSON.parse(event.body);
      abcNotation = data.abcNotation;
    } catch (error) {
      const response = {
        statusCode: 500,
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ error: 'Invalid JSON input' })
      }
      return response;
    }

    if (!abcNotation) {
      const response = {
        statusCode: 500,
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ error: 'ABC notation text is required' }) + JSON.stringify(event)
      }
      return response;
    }

    const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = window.document;

    var svgOutput;
    try {
      const container = document.createElement('div');
      // console.log(abcjs, typeof(abcjs))
      console.log(abcjs.renderAbc, typeof(abcjs.renderAbc))
      abcjs.renderAbc(container, abcNotation, { add_classes: true });
      svgOutput = container.innerHTML;

      if (!svgOutput.startsWith('<?xml')) {
        svgOutput = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n` + svgOutput;
      }
    } catch (error) {
      console.error(error)
      const response = {
        statusCode: 500,
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ error: 'Error rendering SVG' })
      }
      return response;
    } finally {
      delete global.document;
    }
    const response = {
      statusCode: 200,
      headers: {'content-type': 'image/svg+xml'},
      body: svgOutput
    };

    return response;
  };
