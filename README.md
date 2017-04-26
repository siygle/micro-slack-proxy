## micro-slack-proxy

A tool try to make slack app development easier. Built with [zeit/micro](https://github.com/zeit/micro) and can easily host on [now](https://zeit.co/now). Then you can assign deployed URL as your slack app URL. All traffic would proxy to your dev host (with localtunnel or ngrok).

### How-to

Remember assign `NOW_LOGS_KEY` and `HOST` env variables. **NOW_LOGS_KEY** is for debug, it required by [logs.now.sh](https://logs.now.sh/) which can let you see now app's log messages. **HOST** should be your local dev URL. (e.g., https://xxxx.ngrok.io if you use ngrok service)

```
now -e NOW_LOGS_KEY=$YOUR_SECRET_KEY -e HOST=$YOUR_DEV_HOST 
```

You can also set an alias for your deployed app URL, you can assign this URL for slack app on setting page. Don't need to go update every time when you change your local dev URL.
```
now alias set $NOW_DEPLOYED_URL $YOUR_SPECIAL_URL
```
