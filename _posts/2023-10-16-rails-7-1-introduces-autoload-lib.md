---
layout:     post
title:      Rails 7.1 Introduces Autoload Lib and Ignore Sub-Directories with config.autoload_lib(ignore:) Method
description:    Autoloading lib directory isn't always straightforward. In this blog post, we'll delve into the autoloading of the lib directory using config.autoload_lib(ignore:).
tags: [rails]
---

This post is also published in [blog.saeloun.com](https://blog.saeloun.com/2023/10/16/rails-7-1-introduces-autoload-lib/).

There are many new features and enhancements in Rails 7.1, which was recently released. The addition of a new configuration method, `config.autoload_lib(ignore:)`, is one of the features.

In Rails, the `lib` directory is frequently used for custom modules, utility classes, and other shared pieces of code. But as the framework has evolved, there have been modifications to how Rails handles the `lib` directory.

By default, engines or apps do not include the `lib` directory in their autoload paths.

This configuration enables us to autoload files in the `lib` sub-directory 
and it allows us to ignore specific folders in the `lib` directory as well.

### Autoload Paths in Early Versions of Rails: 

Prior to Rails 3, the `lib` directory was autoloaded by default in earlier versions of Rails. When classes or modules are referred to in our application, Rails will automatically search the folders listed in autoloaded paths to locate 
and load those references.
As a result, any Ruby files added to the lib directory would be loaded immediately in both development 
and production environments.

Including `lib` in the autoload paths appeared to be convenient, but it was not an ideal solution when apps were operating in production mode. 
Rails uses eager loading, in which all classes and modules are loaded in advance for better performance. It wasn't always suitable for `lib` files, such as "generators," meant for development, not automatic loading in a running application.

Starting with Rails 3, the `lib` directory was removed from the standard autoload paths. As a result, Rails won't load classes or modules from the `lib` directory by default. Check [Rails 3.0 general configuration](https://guides.rubyonrails.org/v3.0/configuring.html#rails-general-configuration) 
and [Rails 2.3 configuration](https://guides.rubyonrails.org/v2.3/configuring.html)

### Before:

Starting with Rails version 6, we can pass the `lib` path to the  `autoload_paths` and `eager_load_paths` methods. 
This will load all the classes 
and modules inside the lib sub-directory.

Under the hood, the autoloader paths uses [Zeitwerk](https://github.com/fxn/zeitwerk) which loads the classes 
and modules in the project on-demand without calling the `require`.

The `autoload_paths` loads every sub-directory in the `app` directory by default except assets, javascript, and views.

We can ignore any sub-directories in the lib directory that do not contain Ruby files by passing their paths to `Rails.autoloaders.main.ignore`.

{% highlight ruby %}

# config/application.rb

config.autoload_paths << "#{Rails.root}/lib"
config.eager_load_paths << "#{Rails.root}/lib"

%w(assets generators tasks templates).each do |subdir|
  Rails.autoloaders.main.ignore("#{Rails.root}/lib/#{subdir}")
end

{% endhighlight %}


### After:

From Rails 7.1, `config.autoload_lib(ignore:)` method adds the `lib` directory to `config.autoload_paths` and `config.eager_load_paths`.

It cannot be used by engines and must be called from `config/application.rb` or `config/environments/*.rb`

{% highlight ruby %}

  # config/application.rb

  config.autoload_lib(ignore: %w(assets tasks))

{% endhighlight %}

The `config.autoload_lib(ignore:)` method also allow us to avoid autoloading or eager loading specific sub-directories inside the `lib` directory. We can specify the sub-directory names that need to be ignored using the ignore keyword argument, as shown in the above example. In this case, the `assets` and `tasks` sub-directories inside the lib directory will not be autoloaded.
