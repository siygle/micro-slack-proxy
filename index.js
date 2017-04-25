require('now-logs')(process.env.NOW_LOGS_KEY)
const { json, send } = require('micro')
const parse = require('urlencoded-body-parser')
const contentType = require('content-type')
const fetch = require('node-fetch')
const qs = require('querystring')
const debug = require('debug')('slack-sandbox-proxy')

const PROXY_HOST = process.env.HOST

if (!PROXY_HOST) {
  console.log('Need to assign proxy target host')
  process.exit(1)
}

async function _prepareProxy(type, req) {
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
      console.error(`Not support req type: ${reqContent.type}`)
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
  const reqContent = contentType.parse(req)
  console.log('req', reqContent)

  let jsData = await _prepareProxy(reqContent.type, req)
  if (!jsData) {
    console.error('invalid data format')
    return ''
  }

  let resData
  const PROXY = `${PROXY_HOST}${req.url}`
  switch (String(req.method).toUpperCase()) {
    case 'GET':
      resData = await fetch(PROXY)
      break
    case 'POST':
      resData = await fetch(PROXY, { 
        method: 'POST', 
        body: jsData.body,
        headers: jsData.header
      })
      break
    case 'PUT':
      resData = await fetch(PROXY, { 
        method: 'PUT', 
        body: jsData.body,
        headers: jsData.header
      })
      break
    case 'DELETE':
      resData = await fetch(PROXY, { method: 'DELETE' })
      break
    default:
      console.log(`Not support request method: ${req.metho}`)
  }

  const resBuffer = await resData.buffer()
  console.log('res', resBuffer, resBuffer.length)

  if (resBuffer.length > 0) {
    try {
      const resJson = JSON.parse(resBuffer.toString())
      return send(res, resData.status, resJson)
    } catch (e) {
      return send(res, resData.status)
    }
  } else {
    return send(res, resData.status)
  }
}
