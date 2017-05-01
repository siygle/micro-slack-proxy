const { json, send } = require('micro')
const parse = require('urlencoded-body-parser')
const contentType = require('content-type')
const fetch = require('node-fetch')
const qs = require('querystring')
const debug = require('debug')('micro-slack-proxy')

const PROXY_HOST = process.env.HOST

if (!PROXY_HOST) {
  console.log('Need to assign proxy target host')
  process.exit(1)
}

async function _prepareProxy (type, req) {
  let tmpData, jsData
  switch (type) {
    case 'application/json':
      tmpData = await json(req)
      jsData = JSON.stringify(tmpData)
      break
    case 'application/x-www-form-urlencoded':
      tmpData = await parse(req)
      jsData = qs.stringify(tmpData)
      break
    default:
      console.error(`Not support req type: ${type}`)
      return false
  }

  return {
    body: jsData,
    header: {
      'Content-Type': type
    }
  }
}

module.exports = async (req, res) => {
  let jsData, resData, resBuffer, resText

  try {
    const reqContent = contentType.parse(req)
    jsData = await _prepareProxy(reqContent.type, req)
    if (!jsData) {
      console.error('invalid data format')
      return ''
    }
  } catch (e) {
    console.log('Did not include content type header')    
  }

  const PROXY = `${PROXY_HOST}${req.url}`
  debug('proxy to: [%s]%s - %o', req.method, PROXY, jsData)
  switch (String(req.method).toUpperCase()) {
    case 'GET':
      resData = await fetch(PROXY)
      resText = await resData.text()
      break
    case 'POST':
      resData = await fetch(PROXY, { 
        method: 'POST', 
        body: jsData.body,
        headers: jsData.header
      })
      resBuffer = await resData.buffer()
      break
    case 'PUT':
      resData = await fetch(PROXY, { 
        method: 'PUT', 
        body: jsData.body,
        headers: jsData.header
      })
      resBuffer = await resData.buffer()
      break
    case 'DELETE':
      resData = await fetch(PROXY, { method: 'DELETE' })
      resBuffer = await resData.buffer()
      break
    default:
      console.error(`Not support request method: ${req.method}`)
  }

  if (resBuffer && resBuffer.length > 0) {
    let bufferContent = resBuffer.toString()
    debug('res buffer: %s', bufferContent)
    try {
      const resJson = JSON.parse(bufferContent)
      return send(res, resData.status, resJson)
    } catch (e) {
      return send(res, resData.status, bufferContent)
    }
  } else if (resText && resText.length > 0) {
    debug('res buffer: %s', resText)
    return send(res, resData.status, resText)
  } else {
    return send(res, resData.status)
  }
}
