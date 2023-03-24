---
layout: post
title: Fix PG version mismatch issue in fly.io
description: Fix PG version mismatch issue in fly.io while creating a dump or restoring a DB
tags: [web, devops]
---

### Problem

Restoring Postgres database in Fly.io is super easy we just need to run the below command in the fly console as mentioned in fly.io [Heroku migration documentation](https://fly.io/docs/rails/getting-started/migrate-from-heroku/#transfer-the-database)

{% highlight bash %}

pg_dump -Fc --no-acl --no-owner -d $HEROKU_DATABASE_URL | pg_restore --verbose --clean --no-acl --no-owner -d $DATABASE_URL

{% endhighlight %}

but sometimes we might get a version miss match error as the fly DB postgres version and the postgres DB version that host in the other service is different.

{% highlight bash %}

pg_dump: server version: 13.10; pg_dump version: 14.7
pg_dump: aborting because of server version mismatch

{% endhighlight %}

### Workaround

As a workaround to fix this version mismatch issue, instead of running the pg_dump and pg_restore in the postgres app we can take a DB dump and restore it to Fly DB from the local environment.

In the below steps, I explained how to restore the DB dump in Fly database.

If you already have a Postgres app in Fly.io skip to [Step 2](#2-connect-to-remote-postgres-db)

#### 1. Create Postgres DB

Create a postgres DB in fly by running the following command,

{% highlight bash %}

fly pg create --name <app name>

{% endhighlight %}

E.g.,

{% highlight bash %}

fly pg create --name myapp-db

{% endhighlight %}


Output be something like this,

{% highlight bash %}

Creating postgres cluster myapp-db in organization personal
Creating app...
Setting secrets...
Provisioning 1 of 1 machines with image flyio/postgres-flex:15.2
Waiting for machine to start...
Machine 5683004b797d8e is created
==> Monitoring health checks
  Waiting for 5683004b797d8e to become healthy (started, 3/3)

Postgres cluster myapp-db created
  Username:    postgres
  Password:    ***************
  Hostname:    myapp-db.internal
  Flycast:     fdaa:0:2e26:0:1::b6
  Proxy port:  5432
  Postgres port:  5433
  Connection string: postgres://postgres:********@myapp-db.flycast:5432

Save your credentials in a secure place -- you won't be able to see them again!

Connect to postgres
Any app within the Brad Gessler organization can connect to this Postgres using the above connection string

Now that you've set up Postgres, here's what you need to understand: https://fly.io/docs/postgres/getting-started/what-you-should-know/

{% endhighlight %}

Store the Postgres cluster credentials somewhere, we will use these credentials later.

#### 2. Connect to remote Postgres DB

{% highlight bash %}

flyctl proxy 5434:5432 -a <DB app name>

{% endhighlight %}

In this case

{% highlight bash %}

flyctl proxy 5434:5432 -a myapp-db

{% endhighlight %}

This will establish a proxy forwarding to the localhost in port 5434.

#### 3. Create a new DB

*Skip this step if Postgres cluster already has database with app's name.*

In a new terminal run the following command,

{% highlight bash %}

  psql -h localhost -p 5434 -U <User name from credential>

{% endhighlight %}

In this case

{% highlight bash %}

  psql -h localhost -p 5434 -U postgres

{% endhighlight %}

Enter the password(from the credentials) then in psql console run the following command,

{% highlight bash %}

CREATE DATABASE <web app name>;

{% endhighlight %}

E.g.,

{% highlight bash %}

CREATE DATABASE myapp;

{% endhighlight %}

This will create the DB and ensure that the DB name is the same as the app name.

#### 4. Restore Dump to DB

Open a terminal in the path where you have the PG dump file and run the following command,

{% highlight bash %}

pg_restore -v -d postgresql://<user>:<password@localhost:5434/<database_name> <  <pg dump file path>

{% endhighlight %}

E.g.,

{% highlight bash %}

pg_restore -v -d postgresql://postgres:***************@localhost:5434/myapp < filename.dump

{% endhighlight %}

This will restore the records in the DB.

#### 5. Attaching a Fly app

*Skip this step if the app is attached to Postgres cluster.*

Ensure that the fly web app doesn't have a secret key with the name `DATABASE_URL`, if a secret with a name exists then unset that secret by running the following command,

{% highlight bash %}

 fly secrets unset DATABASE_URL -a <web app name>

{% endhighlight %}

in this case,

{% highlight bash %}

 fly secrets unset DATABASE_URL -a myapp

{% endhighlight %}

This will remove the `DATABASE_URL` secret from the web app.

To attach the fly app to postgres cluster run the following command,

{% highlight bash %}

flyctl postgres attach <DB app name> --app <web app name>

{% endhighlight %}

in this case,

{% highlight bash %}

flyctl postgres attach myapp-db --app myapp

{% endhighlight %}

Running this command will add `DATABASE_URL` secret to the web app.

Now when you access the site you see all the data there and you can also verify the records from rails console. 