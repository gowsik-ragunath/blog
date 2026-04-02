---
layout:     post
title:      "Deep dive into Rails: Part 1 - Request lifecycle"
description:    A deep dive into how Rails handle request, from DNS lookup to rails middleware and back
tags: [rails]
---

### Request lifecyle

When a browser sends request to a website like https://gowsik.info, the domain name will be translated into an IP address by DNS lookup.
Browser opens a connection to the server and the request is passed using http or https protocal.

```
GET / HTTP/1.1
Host: gowsik.info
```

The web server like Nginx, Apache will receive this request in either port 80(http) or 443(https), the web server will act as a reverse proxy
and route to the application server(Rails) which will be handled by [Rack](https://github.com/rack/rack), all Rack needs is a `config.ru` file
usually present in the root directory of a Rails app.

To send back a response all Rack needs is a response tuple which contains of status, header and body.

```
# ./config.ru
# This file is used by Rack-based servers to start the application.

require_relative "config/environment"

run do |env|
  [200, {}, ["Hello World"]]
end

# run Rails.application
# Rails.application.load_server
```

To see rack in action try commanting out the rails command and just add the run block and spin up the rack server
by running the command in the terminal

```
rackup
```

This will spinup the server in http://127.0.0.1:9292 try sending request to any path you will get
200 as the status, {} as the header and ["Hello World"] as the body which is the response tuple.

or open rails console and running the following command to check

```
rails c
> env = Rack::MockRequest.env_for("http://127.0.0.1:9292")
> status, header, body = Rails.application.call(env)
```

Restore config.ru file back to its orginal state and run middleware

```
rails middleware
> ...
> ...
> ...
> use Rack::ETag
> use Rack::TempfileReaper
> run SampleTestApp::Application.routes
```

The rack app looks for rails routes in `config/routes.rb` and process the request based on the routing rules.
This will list all the middleware that rails uses to process the request.
