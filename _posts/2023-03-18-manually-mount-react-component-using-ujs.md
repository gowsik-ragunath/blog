---
layout: post
title: Manually mount react component using UJS
description: Mount react components manually while rendering element on JS request.
tags: [web, rails]
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/02/16/manually-mount-react-component-using-ujs)

In this blog post, we will explore the process of manually 
mounting React components in response to a JavaScript request. 

With the React-Rails gem, 
we can render React components within our DOM using the `react_component` view helper. 
We simply need to provide the component name 
and its props as arguments. 
When the page changes, 
the React-Rails gem takes care of mounting the component automatically. 
However, when we dynamically render an HTML element in response to a JavaScript request, 
the components won't be mounted automatically. 
In such a scenario, 
we have to manually mount the React components by using,

{% highlight javascript %}

ReactRailsUJS.mountComponents()

{% endhighlight %}

Let’s check out an example,

In the below form, there are two react components for the phone number and departure time fields,

{% highlight ruby %}
# app/view/passenger/_form.html.erb

<%= form_with(model: passenger) do |form| %>
 <div>
   <%= form.label :name, style: "display: block" %>
   <%= form.text_field :name %>
 </div>

 <%= react_component "phoneNumber", name: "passenger[phone_number]" %>
 <%= react_component "depatureTime", name: "passenger[depature_time]" %>

 <div>
   <%= form.submit %>
 </div>
<% end %>

{% endhighlight %}

{% highlight javascript %}
// app/view/passenger/new.js.erb

var passengerModal = document.querySelector(“#passengerModal”);
var modalContent = passengerModal.querySelector(".modal-body");

modalContent.innerHTML = “<%= j render “form”, passenger: Passenger.new %>”;

{% endhighlight %}

We are attaching this form to DOM by a JS request but those react components won’t mount when the server generated elements are attached to DOM.

{% include image.html path="mount-react/without-react-component.png" path-detail="mount-react/without-react-component.png" alt="without-react-component" %}

React-rails gem allows us to manually mount the react component by triggering `mountComponents` function,


{% highlight javascript %}
// app/view/passenger/new.js.erb

var passengerModal = document.querySelector(“#passengerModal”);
var modalContent = passengerModal.querySelector(".modal-body");

modalContent.innerHTML = “<%= j render “new”, passenger: Passenger.new %>”;

ReactRailsUJS.mountComponents()

{% endhighlight %}

This function call will mount all the react components that are on the page.

{% include image.html path="mount-react/with-react-component.png" path-detail="mount-react/with-react-component.png" alt="with-react-component" %}

### Final Thoughts 

In conclusion, manually mounting React components can be a powerful technique 
for web developers seeking greater control 
and flexibility over their applications. 
Whether we're building a single-page application 
or a more complex web platform, understanding 
how to manually mount React components can help us optimize performance 
and improve the user experience.