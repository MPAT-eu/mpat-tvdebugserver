# TV Debug Environment

## Introduction

This document describes the TV debug environment created by ParisTech. The goal is to be able to have logging in the TV frontend code and flexible reading of the logs from the web. 

## Installation
In the current directory, do:
```
npm install
```

## Usage
### Server
Run the server on the same machine as your MPAT server
```
node app.js
```

### Debug application
In your web browser, browse to 
```
http://localhost:3000/debugApp.html
```



## Architecture
The environment consists in:
- A node.js server that responds to logging requests from TV and information 
requests from the debug web app. **For CORS reasons, the server has to reside 
on the same machine as the HbbTV content server.** Currently, it is using port 
3000, but you can change this in the server app.js and in the JS library.
- A JS library with one function: log(message)
- A debug web application that gets the logs from the server

## Server
The server serves the debug web application as debugApp.html

The server also responds to the following URLs:
```
/log?message=XXXXXX
``` 
This is a call from a TV to log XXXXXX. 
The server stores the time, the IP address of the TV caller and the message. 
```
/getalllogs
```

This is a call from the debug application for the complete log

```
/getlogs?ip=00.00.00.00
```

This is a call from the debug application for the subset of the log concerning the TV which IP is given

```
/clearlogs
```
This is a call to reset the log file

setloglevel, getloglevel, dumpData, cleanup, reset are for future debug use

## JS Library
The JS library is extremely simple. 
It is loaded as global variable `TVDebugServerInterface`. 
It has one function/property: `log(message)`. 
This is a call to log the string message. 
The server stores the time, the IP address of the TV caller and the message.

It is integrated in `index.php` in the `mpat-theme`.

A typical usage example is:
```
TVDebugServerInterface.log(“receiving a streamevent with payload ”+ev.text);
```

## Debug Web App

The TV Debug Web App has the following elements:
- A message zone displaying recents messages first
- A textfield to edit in either the IP address of the TV you are interested in (usually) or log messages if you want to test the system.
- A series of buttons.

The buttons are:
- Get all logs: show all logs, most recent line first, in the log display area
- Get logs from single TV: if you specify an IP number in the text field below the log display area, this button filters the logs to display just the ones with that IP number.
- Get logs from single TV continuously: same as above but the display is refreshed every second (new button, lighter blue).
- Stop getting logs: stop the continuous refresh (new button, lighter blue).
- Send log message: this is a debugging feature for the debug server, not for general usage.
- Orange buttons are for possible future use.
