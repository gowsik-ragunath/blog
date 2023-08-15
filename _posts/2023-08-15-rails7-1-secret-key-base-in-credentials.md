---
layout: post
title: Rails 7.1 Store secret_key_base In Credentials For Local Environment
description: In upcoming Rails 7.1 secret_key_base will be stored in credentials instead of secrets, as secrets has been deprecated in favour of credentials
tags: [rails]
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/08/11/rails-7-1-store-secret-key-base-in-rails-config/).

Rails credentials was introduced in [Rails 5.2](https://guides.rubyonrails.org/5_2_release_notes.html) and in Rails 7.1,
`secrets` has been deprecated in favor of `credentials`.

In the latest stable version of Rails (Rails 7.0.6), `secrets` is used for storing the `secret_key_base` in the local environment. However, 
from Rails 7.1 onwards, `secret_key_base` will be moved to credentials.

#### What is a secret_key_base?

According to [this Rails documentation](https://api.rubyonrails.org/classes/Rails/Application.html#method-i-secret_key_base),

> The secret_key_base is used as the input secret to the application's key generator, which in turn
> is used to create all ActiveSupport::MessageVerifier and ActiveSupport::MessageEncryptor instances,
> including the ones that sign and encrypt cookies.

`secret_key_base` is a randomly generated string which is similar to `salt` in Cryptography, this value is primarily used 
to add an extra layer of security to prevent unauthorized users from tampering with cookies, sessions, 
or other data within the application.

`secret_key_base` is used by `ActiveSupport::MessageVerifier` and `ActiveSupport::MessageEncryptor`.

- ActiveSupport::MessageVerifier will generate and verify signed messages to prevent tampering.
- ActiveSupport::MessageEncryptor will encrypt the values in Base64 and we can pass those values safely.

In the local environment, both the development and test `secret_key_base` value will be fetched from `tmp/development_secret.txt`(before Rails 7.1) or 
`tmp/local_secret.txt`(from Rails 7.1). This file will have the value which will be used as `secret_key_base`.

For other environments, Rails will first try to get `secret_key_base` value from `ENV["SECRET_KEY_BASE"]`, then `credentials.secret_key_base`, and finally 
`secrets.secret_key_base`

While building a docker image, we have to precompile assets. In this case, we don't need to pass the actual secret key instead, we can pass some 
random values in `ENV["SECRET_KEY_BASE_DUMMY"]` environment variable which will be stored in `secret_key_base`.

### Before:

In the previous version of Rails, the secret_key_base is stored in `Rails.application.secrets.secret_key_base`. 

We can get `secret_key_base` in the application or from the rails console using the following command,

{% highlight ruby %}

Rails.application.secrets.secret_key_base

# "e965987d66462fdf254a9b11aec30dbc27e37e53c01babfd0a52745d66e6f4ad186ee80151628c72cd0c0"

Rails.application.credentials.secret_key_base

# "e965987d66462fdf254a9b11aec30dbc27e37e53c01babfd0a52745d66e6f4ad186ee80151628c72cd0c0"

{% endhighlight %}

### After:

With [this change](https://github.com/rails/rails/pull/48470), secret_key_base will be stored in `Rails.application.credentials.secret_key_base`.

{% highlight ruby %}

Rails.application.credentials.secret_key_base

# "e965987d66462fdf254a9b11aec30dbc27e37e53c01babfd0a52745d66e6f4ad186ee80151628c72cd0c0"

Rails.application.secrets.secret_key_base

# DEPRECATION WARNING: `Rails.application.secrets` is deprecated in favor of `Rails.application.credentials` and will be removed in Rails 7.2. (called from eval at /Users/gowsikvivekanandan/.rbenv/versions/3.2.2/lib/ruby/gems/3.2.0/gems/irb-1.7.4/lib/irb/workspace.rb:113)

# "e965987d66462fdf254a9b11aec30dbc27e37e53c01babfd0a52745d66e6f4ad186ee80151628c72cd0c0"

{% endhighlight %}

When attempting to retrieve the `secret_key_base` value from `secrets`, a deprecation warning is printed to inform users about the upcoming removal of `secrets` in Rails 7.2.

#### Correct way to get secret_key_base:

Instead of accessing `secret_key_base` from secrets or credentials directly, it is recommended to always retrieve this value by calling `Rails.application.secret_key_base`.

{% highlight ruby %}

Rails.application.secret_key_base

# "e965987d66462fdf254a9b11aec30dbc27e37e53c01babfd0a52745d66e6f4ad186ee80151628c72cd0c0"

{% endhighlight %}

[Rails.application.secret_key_base](https://github.com/p8/rails/blob/21c34550549ed90f79565b333e06c7cee79c546e/railties/lib/rails/application.rb#L469-L477) will return the `secret_key_base` value based on the current environment.
