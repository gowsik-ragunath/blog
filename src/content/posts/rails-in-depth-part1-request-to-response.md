---
pubDate: 2026-05-03
title: "Rails In-depth Part 1: From request to response"
description: "Rails In-depth Part 1: tracing the lifecycle of a Rails request through Rack, config.ru, and the router."
tags: [rails]
draft: false
---

When a client request starts its journey from the browser or from a session,
the request will have the client's IP added to the `X-Forwarded-For` header.

The domain address will be translated to an IP address by the DNS server and
routed to the correct server. In that process, the request will make different
hops before reaching the destination server.

Once the request has reached the destination server, if there is a reverse proxy (like
HAProxy or Nginx), it will pass the request down to the Rails server.

The first place the request will be processed is `config.ru`, which is essentially a [Rack](https://github.com/rack/rack) file. Rack is a middleware interface that handles the request
and helps Rails construct a response.

For example, if we run `bin/rackup` and a request is made to https://example.com/search
with `config.ru` like:

```ruby
# config.ru

run do |env|
  if env['PATH_INFO'] == '/search'
    [
      200,
      { 'Content-Type' => 'text/plain' },
      ['Search results here!']
    ]
  end
end
```

the server will respond with `Search results here!` even without any involvement
of Rails itself.

The `env` hash contains everything about the HTTP request. Rack provides
these details to the `call` method. If we maintain all these paths in different classes,
we can load those classes using `run`.

We can do the same in `route.rb`

```ruby
# config/route.rb

Rails.application.routes.draw do
  get '/search', to: proc { |env|
    [
      200,
      { 'Content-Type' => 'text/plain' },
      ['Search results here!']
    ]
  }
end
```

For a Rails app with a search controller, we can do the same:


```ruby
# config/route.rb

Rails.application.routes.draw do
  resources :search, only: [:index]
end
```

```ruby
# app/controllers/search_controller.rb

class SearchController
  def index
    render plain: 'Search results here!', status: 200
  end
end
````

References:

- https://blog.skylight.io/the-lifecycle-of-a-request/
- https://blog.appsignal.com/2024/10/30/the-basics-of-rack-for-ruby.html