## micro-slack-proxy

A tool try to make slack app development easier. Bulit with [zeit/micro](https://github.com/zeit/micro) and can easily host on [now](https://zeit.co/now). Let you can assign your slack app url to deployed URL then proxy all traffic to your dev host (with localtunnel or ngrok).

### How-to

Remember to assign `NOW_LOGS_KEY` and `HOST` env variables. **NOW_LOGS_KEY** is for debug, it required by [logs.now.sh](https://logs.now.sh/) which can let you see now app's log. **HOST** should be your local dev URL. (e.g., https://xxxx.ngrok.io if you use ngrok service)

```
now -e NOW_LOGS_KEY=$YOUR_SECRET_KEY -e HOST=$YOUR_DEV_HOST 
```

You can also set an alias for your deployed app URL, then you can assign this URL for slack app on setting page.
```
now alias set $YOUR_SPECIAL_URL
```