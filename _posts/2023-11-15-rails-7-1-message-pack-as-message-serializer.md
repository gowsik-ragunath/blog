---
layout:     post
title:      Rails 7.1 Adds Support for MessagePack as Message Serializer
description:    MessagePack is now supported in Rails 7.1, this new serializer enables the generation of smaller payloads and significantly faster serialization and deserialization compared to other serializers.
tags: [rails]
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/11/15/rails-7-1-message-pack-as-message-serializer/).

In Rails 7.1, support for MessagePack has been added, and it can be used with `MessageEncryptor` and `MessageVerifier`. `config.active_support.message_serializer` will also accept `:message_pack` and `:message_pack_allow_marshal` as serializers.

### What is MessagePack?

[MessagePack](https://msgpack.org/) is an efficient binary serialization format that enables the exchange of data among multiple languages, similar to JSON.

It is faster and more compact compared to JSON, as it is optimized for binary data serialization. Specifically designed for efficiently representing complex data structures, it makes the payload smaller and faster to serialize and deserialize.

The following is a message serialized by `MessagePack`:

{% highlight ruby %}

require 'msgpack'
msg = [1,2,3].to_msgpack  #=> "\x93\x01\x02\x03"
MessagePack.unpack(msg)   #=> [1,2,3]

{% endhighlight %}

[Reference](https://msgpack.org/index.html#messagepack-for-ruby)

Unlike [BSON](https://bsonspec.org/), which is a similar serialization format and less verbose, BSON is designed for faster in-memory manipulation, whereas MessagePack is designed for efficient network communication.

### Before

Before Rails 7.1, Rails didn't have native support for serializing using MessagePack. We had to install the [msgpack](https://github.com/msgpack/msgpack-ruby) gem and serialize the message.

{% highlight ruby %}

# app/services/secure_message_service.rb

class SecureMessageService
  def self.encrypt(message)
    message_encryptor.encrypt_and_sign(message)
  end

  def self.decrypt(encrypted_message)
    message_encryptor.decrypt_and_verify(encrypted_message)
  end

  private

  def self.message_encryptor
    secret_key = ActiveSupport::KeyGenerator.new(Rails.application.secret_key_base).generate_key('salt', 32)
    ActiveSupport::MessageEncryptor.new(secret_key, serializer: MessagePack)
  end
end

{% endhighlight %}

{% highlight ruby %}

# rails c

> encrypted_message = SecureMessageService.encrypt([{:key=>"value"}, [1, 2, 3], {:a=>{:b=>1}}])

=> "AaeKemIH/k7moSB8kgGvsNPJNr7MY1vUlMlwGBk=--AMViwItIvTcwz9Xp--NTMQJJrKKgdA1y1qt/KuWA=="

> SecureMessageService.decrypt(encrypted_message)

=> [{:key=>"value"}, [1, 2, 3], {:a=>{:b=>1}}]

{% endhighlight %}

To use MessagePack with `ActiveSupport::MessageEncryptor`, we need to pass serializer argument with the value `MessagePack`. This ensures that the messages are serialized and deserialized appropriately during both encryption and decryption processes.

### After:

MessagePack is supported starting from Rails 7.1, with [msgpack](https://github.com/msgpack/msgpack-ruby) integrated into it. Rails has also introduced a new class called `ActiveSupport::MessagePack`, designed to serialize most basic Ruby data types.

To configure MessagePack as the default serializer in the Rails application, include the following in `config/application.rb`:

{% highlight ruby %}

# config/application.rb

config.active_support.message_serializer = :message_pack

{% endhighlight %}

In Rails 7.1, the default serializer is `json_allow_marshal`. However, it can fall back to deserializing with `Marshal` so that legacy messages can still be read. We can set MessagePack as the default serializer in the app by using the `config.active_support.message_serializer` configuration method and setting the value as `message_pack`.

{% highlight ruby %}

# app/services/secure_message_service.rb

class SecureMessageService
  def self.encrypt(message)
    message_encryptor.encrypt_and_sign(message)
  end

  def self.decrypt(encrypted_message)
    message_encryptor.decrypt_and_verify(encrypted_message)
  end

  private

  def self.message_encryptor
    secret_key = ActiveSupport::KeyGenerator.new(Rails.application.secret_key_base).generate_key('salt', 32)
    ActiveSupport::MessageEncryptor.new(secret_key)
  end
end

{% endhighlight %}

Since MessagePack is configured as the message serializer using the `config.active_support.message_serializer` method, we do not need to pass the serializer argument to `ActiveSupport::MessageEncryptor` as we did in the previous Rails version.

{% highlight ruby %}

# rails c

> encrypted_message = SecureMessageService.encrypt([{:key=>"value"}, [1, 2, 3], {:a=>{:b=>1}}])

=> "AaeKemIH/k7moSB8kgGvsNPJNr7MY1vUlMlwGBk=--AMViwItIvTcwz9Xp--NTMQJJrKKgdA1y1qt/KuWA=="

> SecureMessageService.decrypt(encrypted_message)

=> [{:key=>"value"}, [1, 2, 3], {:a=>{:b=>1}}]

> ActiveSupport::Messages::Codec.default_serializer

=> :message_pack

{% endhighlight %}

`MessageEncryptor` will serialize the message using `MessagePack` during both encryption and decryption processes. To check the default serializer, we can run `ActiveSupport::Messages::Codec.default_serializer`, which returns `message_pack`.

Along with [message_serializer](https://guides.rubyonrails.org/v7.1/configuring.html#config-active-support-message-serializer), MessagePack can also be used as [cookies_serializer](https://guides.rubyonrails.org/v7.1/configuring.html#config-action-dispatch-cookies-serializer) and [cache_serializer](https://guides.rubyonrails.org/v7.1/caching_with_rails.html#configuration).
