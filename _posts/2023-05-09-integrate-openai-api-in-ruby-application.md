---
layout: post
title: Integrate OpenAI API in Ruby applications
date: 2023-05-22
description: We can integrate OpenAI API in a ruby application by using ruby-openai gem which allows us to build an app with all the ChatGPT 
categories: openai-api chat-gpt ai
author: gowsik
tags: [ruby, openai, chatgpt, ai]
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/05/22/integrate-openai-api-in-ruby-application/).

### What is ChatGPT?

ChatGPT is an artificial intelligence chatbot developed by OpenAI that allow us to have human-like conversations and generate image based on the text description. It is one of the greatest leaps in natural language processing.

### Integrating OpenAI API in ruby application:

We can implement all the ChatGPT features in a ruby application to make it more engaging for users by integrating OpenAI API. For this, we are using the [ruby-openai](https://github.com/alexrudall/ruby-openai) gem which allows us to use various OpenAI models which we can pick based on the use case.

## Install gem:

Add the `ruby-openai` gem to the Gemfile.

{% highlight ruby %}

gem "ruby-openai"

{% endhighlight %}

Then run `bundle install` to install the gem.

## Get access key:

We have to generate an access key to get a response back, visit [API keys](https://platform.openai.com/account/api-keys) page and create a new secret key.

Copy the secret key and assign it to `OPENAI_ACCESS_TOKEN` environment variable.

{% highlight ruby %}

export OPENAI_ACCESS_TOKEN="xxxxxxxxxxxxxxx"

{% endhighlight %}

## Configure Ruby OpenAI:

If the account is tied to an organization then set the value in this environment variable `OPENAI_ORGANIZATION_ID`. We can find the organization ID value from the [Settings](https://platform.openai.com/account/org-settings) page.

{% highlight ruby %}

OpenAI.configure do |config|
  config.access_token = ENV.fetch("OPENAI_ACCESS_TOKEN")
  config.organization_id = ENV.fetch("OPENAI_ORGANIZATION_ID") # Optional.
end

{% endhighlight %}

Then to create a client,

{% highlight ruby %}

client = OpenAI::Client.new

{% endhighlight %}

### Choosing the right model:

Before diving into models we have to understand what a token is.

This is an explanation from [OpenAI article](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them),

>  Tokens can be thought of as pieces of words. Before the API processes the prompts, the input is broken down into tokens. These tokens are not cut up exactly where the words start or end - tokens can include trailing spaces and even sub-words.
> 
> - 1 token ~= 4 chars in English
> - 1 token ~= ¾ words
> - 100 tokens ~= 75 words

We can consider approx. 4 characters as a token.

OpenAI API has various models in each version and it can be used for different use cases,

**1) GPT-4**

GPT-4 model is great at solving complex problems with great accuracy and much more capable than the previous models, for most basic tasks there is no significant difference between GPT-4 and GPT-3.5 models.

- **gpt-4** model can do complex tasks and optimized chat it has max support for 8,192 tokens and the model is training data up to Sep 2021.
- **gpt-4-32k** model has the same capability as gpt-4 model but max 32,768 tokens support and training data up to Sep 2021.

**2) GPT-3.5**

GPT-3.5 models can understand and generate natural language or code. `gpt-3.5-turbo` is optimized for chat but works well for traditional tasks.

- **gpt-3.5-turbo** model is the most capable GPT-3.5 model which is optimized for chat and has max token support of 4,096 and training data up to Sept 2021.

- **text-davinci-003** model can do any language task with better quality, longer output, and consistent instruction. It has max token support of 4,096 and training data up to Jun 2021.

- **text-davinci-002** model is similar capabilities to text-davinci-003 but trained with supervised fine-tuning which has max token support of 4,096 and training data up to Jun 2021.

- **code-davinci-002** model is optimized for code completion tasks that have max token support of 8,001 and training data up to Jun 2021.

**3) GPT-3**

GPT-3 models can understand and generate natural language. These models were superseded by the more powerful GPT-3.5 generation models. All the models have max token support of 2,049 and training data up to Oct 2019.

- **davinci** model is the most capable model and can do any tasks with higher quality than other models.

- **curie** model is very capable but faster and lower cost compared to the davinci model.

- **babbage** model is capable of straightforward tasks, is very fast, and has a lower cost.

- **ada** model is capable of very simple tasks, the very fastest model in GPT-3 model, and has the lowest cost.

**4) DALL-E**

DALL-E model can generate and edit images from the description in natural language.

**5) Whisper**

Whisper model can convert audio into text, it can perform multilingual speech recognition, speech translation, and language identification.

**6) Embedding**

Embeddings are a numerical representation of text that can be used to measure the relatedness between two pieces of text these models are useful for search, clustering, recommendations, anomaly detection, and classification tasks.

**7) Moderation**

A fine-tuned model that can detect whether text may be sensitive or unsafe, this model will check whether the passed content complies with OpenAI usage policies. 

### Chat:

We are using the `gpt-3.5-turbo` model as gpt-4 has only limited access at the time of writing this post.

In a request, We have to pass two required parameters, `model` and `messages`. Inside the `messages` parameter, we should pass the `role` and `content` parameter values.

In the `temperature` (optional) parameter, we have to pass a value between 0 to 2. A higher temperature value will result in more unpredictable and diverse responses and a lower temperature value will result in predictable and conservative responses.

OpenAI API supports three roles,

**system** - System instruction helps set the behavior of the assistant (OpenAI response), it is the high-level instruction given for the conversation.

**user** - Instruction passed by the end user.

**assistant** - The assistant messages help store prior responses.

As a response Ruby OpenAI API will return an object, this object will have,

**id** - Chat ID.

**object** - Name of the API that returns the response.

**created** - Response created at timestamp.

**model** - Model used to generate the response.

**usage** - Usage returns the number of tokens passed and generated.

**choices** - Message generated by the model and the status of the result.

In this case, we have set the role as a `user` and the message or question in the `content` parameter.

**Example 1: Solving Problems:**

In the below example, we have asked Open AI API to calculate the time taken for a spaceship to reach the Sun from the Earth which returns a step by step calculations.

{% highlight ruby %}

client = OpenAI::Client.new

response = client.chat(
    parameters: {
        model: "gpt-3.5-turbo", # Required.
        messages: [{ role: "user", content: "If a spaceship is travelling at a speed of 70 KM/s, how long would it take to reach the sun from the earth?"}], # Required.
        temperature: 0.7,
    })

puts response.dig("choices", 0, "message", "content")

# The distance between the Earth and the Sun is approximately 149.6 million kilometers. 

# To calculate the time it would take for the spaceship to reach the Sun from the Earth:

# time = distance ÷ speed

# time = 149,600,000 km ÷ 70 km/s

# time = 2,137,143 seconds

# Convert seconds to days:

# 2,137,143 seconds ÷ 86,400 seconds/day = 24.7 days

# Therefore, it would take approximately 24.7 days for the spaceship to reach the Sun from the Earth at a speed of 70 km/s.

{% endhighlight %}

**Example 2: Technical Questions:**

In the below example, we have asked Open AI to explain about `<></>` use in react.

{% highlight ruby %}

response = client.chat(
    parameters: {
        model: "gpt-3.5-turbo", # Required.
        messages: [{ role: "user", content: "What is <> in react?"}], # Required.
        temperature: 0.7,
    })

puts response.dig("choices", 0, "message", "content")

# In React, the <> symbol, also known as the Fragment shorthand, is used to group multiple elements together without adding....

{% endhighlight %}

**Example 3: Back and forth conversation:**


In the below example, we can pass the prior conversation history as an instruction to have a more interactive and dynamic conversation.


{% highlight ruby %}

response = client.chat(
  parameters: {
    model: "gpt-3.5-turbo", # Required.
    messages: [
      { role: "system", content: "You are an assistant that recommends movies" }
    ],
    temperature: 0.7,
  }
)

puts response.dig("choices", 0, "message", "content")

# Great, I am happy to help you with movie recommendations. Can you please let me know your preference? Do you have any specific genre or language in mind?

response = client.chat(
  parameters: {
    model: "gpt-3.5-turbo", # Required.
    messages: [
      { role: "system", content: "You are an assistant that recommends movies" },
      { role: "user", content: "Suggest an animation movie" },
    ],
    temperature: 0.7,
  }
)

puts response.dig("choices", 0, "message", "content")
# Sure, how about "Soul" directed by Pete Docter and Kemp Powers? It's a heartwarming and visually stunning movie about a middle school music teacher named Joe who finally gets his big break as a jazz musician, but then falls into a manhole and finds himself in a mystical realm where souls are prepared for life on earth. With the help of a spunky and determined soul named 22, Joe learns the true meaning of life and the importance of following your passions. It's a great movie for all ages and has won multiple awards including the Academy Award for Best Animated Feature.

response = client.chat(
  parameters: {
    model: "gpt-3.5-turbo", # Required.
    messages: [
      { role: "system", content: "You are an assistant that recommends movies" },
      { role: "user", content: "Suggest an animation movie" },
      { role: "assistant", content: "Sure, how about 'Soul' directed by Pete Docter and Kemp Powers? It's a heartwarming and visually stunning movie about a middle school music teacher named Joe who finally gets his big break as a jazz musician, but then falls into a manhole and finds himself in a mystical realm where souls are prepared for life on earth. With the help of a spunky and determined soul named 22, Joe learns the true meaning of life and the importance of following your passions. It's a great movie for all ages and has won multiple awards including the Academy Award for Best Animated Feature."},
      { role: "user", content: "What is the runtime of the movie?" }
    ],
    temperature: 0.7,
  }
)

puts response.dig("choices", 0, "message", "content")

# The runtime of 'Soul' is 1 hour and 47 minutes.

{% endhighlight %}

### Stream the response:

To make the application more engaging for users we can stream a chuck of responses.

For this, we'll have to pass a `stream` parameter along with the `role` and `content` to stream the result.

In the stream parameter, we can pass a proc that prints the stream of response chunks that is generated. With this, we can set up a ChatGPT-like messaging stream in the Rails app by following [this guide](https://gist.github.com/alexrudall/cb5ee1e109353ef358adb4e66631799d).

In the below example, we have asked Open AI API to explain the Color theory, the result will be a detailed explanation of color theory instead of waiting for the complete result we can stream chunks to the user and improve the user experience.

{% highlight ruby %}

client.chat(
    parameters: {
        model: "gpt-3.5-turbo", # Required.
        messages: [{ role: "user", content: "Explain about color theory"}], # Required.
        temperature: 1,
        stream: proc do |chunk, _bytesize|
            print chunk.dig("choices", 0, "delta", "content")
        end
    })
# The Hubble constant is a measure of the rate at which the universe is expanding. It is denoted by the symbol H0.....

{% endhighlight %}

### Complete text:

We will be using the GPT-3.5 `text-davinci-003` model to complete the text.

We have to pass the content in `prompt` parameters which the model uses to complete the text. We can also pass the maximum tokens that need to be generated to complete the text.

**Example 1: Social media description:**

In the below example, We have asked Open AI to complete a social media description.

{% highlight ruby %}

response = client.completions(
    parameters: {
        model: "text-davinci-003",
        prompt: "Complete this social media description 'Went for a hike'",
        max_tokens: 15
    })
puts response["choices"].map { |c| c["text"] }

# Today I went for a hike in nature! It was a peaceful

{% endhighlight %}

**Example 2: Ask Open AI API to complete the code!:**

In the below example, We have asked Open AI API to complete a simple ruby addition code.

{% highlight ruby %}

response = client.completions(
    parameters: {
        model: "text-davinci-003",
        prompt: "ruby sum of two numbers 'a = 10; b = 12;",
        max_tokens: 20
    })
puts response["choices"].map { |c| c["text"] }

# a + b # => 22

{% endhighlight %}


### Edit text:

We will be using the `text-davinci-edit-001` model to edit the text.

We have to pass the content in `input` parameter and a description of the task in `instruction` parameter.

**Example 1: Transplate code to different programming language:**

In the below example, we have instructed Open AI API to translate a code snippet to C. In the results, it returns the entire C program and the interesting part is I didn't even mention the programming language of the code snippet that I have passed.

{% highlight ruby %}

response = client.edits(
  parameters: {
    model: "text-davinci-edit-001",
    input: "var a=10; var b=13;",
    instruction: "Convert the code into C language"
  }
)

puts response.dig("choices", 0, "text")

# #include<stdio.h>
# int main()                                                                         
# {                                                                                  
# int a=10,b=13;                                                                 
# printf("%d\t%d", a, b);                                                           
# return 0;                                                                         
# }    

{% endhighlight %}

**Example 2: Find and replace and formatting:**

In this below example, we have passed a input and insturcted Open AI API to replace a word and capitalize each word in the sentence.

{% highlight ruby %}

response = client.edits(
  parameters: {
    model: "text-davinci-edit-001",
    input: "the once was a ship that put",
    instruction: "Replace the with there and capitalize each word in the sentence"
  }
)

puts response.dig("choices", 0, "text")

# There Once Was A Ship That Put

{% endhighlight %}

### Moderate text:

We can use moderate text with OpenAI API, it will check whether the passed content complies with OpenAI usage policies. 

There are seven categories and OpenAI API generate score for all seven categories, the scores will be between 0 to 1 a higher value denotes higher confidence [ref.](https://platform.openai.com/docs/guides/moderation/overview)

In the below example, we will be using the `text-moderation-stable` model and as a result, the score of the hate category will be returned.

{% highlight ruby %}

 response = client.moderations(parameters: { input: "I'm worried about that." })

 puts response.dig("results", 0, "category_scores", "hate")
 # 1.10379015e-05 ~= 0.0000110379

{% endhighlight %}

### Image generator:

Using the DALL-E model we can describe an image or art by describing it in natural language.

{% highlight ruby %}

response = client.images.generate(parameters: { prompt: "Oil painting of a space shuttle", size: "512x512" })

puts response.dig("data", 0, "url")
# https://oaidalleapiprodscus.blob.core.windows.net/private/org-I.....

{% endhighlight %}

In the prompt parameter, we can describe the image that needs to be generated and in the size parameter we can pass the resolution, an image can be generated in 256x256, 512x512, or 1024x1024, if the size parameter is not passed 1024x1024 will be set as default.

This is the image generated,

{% include image.html path="ruby-openai/chat-gpt-oil-painting.png" path-detail="ruby-openai/chat-gpt-oil-painting.png" alt="permission" %}

### Edit image:

We can also edit images but for that, we have to mask the image with a transparent section. The masked section can be altered based on the description.

{% highlight ruby %}

 response = client.images.edit(parameters: { prompt: "A dog standing under tree", image: "tree.png" })

 puts response.dig("data", 0, "url")

# https://oaidalleapiprodscus.blob.core.windows.net/private/org-INB....

{% endhighlight %}

This is the tree image that's used for testing,

{% include image.html path="ruby-openai/tree.png" path-detail="ruby-openai/tree.png" alt="permission" %}

The image generated,

{% include image.html path="ruby-openai/chat-gpt-dog-under-tree.png" path-detail="ruby-openai/chat-gpt-dog-under-tree.png" alt="permission" %}

# Transcribe:

We can use the `whisper-1` model to transcribe the audio.

{% highlight ruby %}

response = client.transcribe(
  parameters: {
  model: "whisper-1",
  file: File.open("Conference.wav")
})

puts response["text"]

# This is Peter. This is Johnny. Kenny. And Josh. We just wanted to take a minute to thank you.

{% endhighlight %}

## Conclusion:

Integrating OpenAI API will open up endless possibilities for improving the user experience and making the site more engaging, it provides versatile language models that can simplify most of the traditional tasks and also solves complex problems. We can use it as a chatbot, to translate or transcribe audio, write or debug code, generate or edit images, and many more things.
