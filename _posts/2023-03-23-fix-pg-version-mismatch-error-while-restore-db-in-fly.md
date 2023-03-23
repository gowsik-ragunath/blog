### 1. Create Postgres DB

Create a postgres DB in fly by running this following command,

```
fly pg create --name <app name>
```

For e.g.,

```
fly pg create --name myapp-db
```


Output be something like this,

```
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
```

Store the postgres cluster credentials somewhere, we will use this credentials later.

### 2. Connect to remote Postgres DB

```
flyctl proxy 5434:5432 -a <DB app name>
```

in this case

```
flyctl proxy 5434:5432 -a myapp-db
```

This will establish a proxy forwarding to the localhost in port 5434

### Create a new DB

In a new terminal run this following command,

```
  psql -h localhost -p 5434 -U <User name from credential>
```

in this case

```
  psql -h localhost -p 5434 -U postgres
```

then enter the password(from the credentials) then in psql console run this following command,

```
CREATE DATABASE <web app name>;
```

for e.g.,

```
CREATE DATABASE myapp;
```

This will create the DB make sure that the DB name is same as app name.

### Restore Dump to DB

Open a terminal in the path where you have the PG dump file and run this following command,

```
pg_restore -v -d postgresql://<user>:<password@localhost:5434/<database_name> <  <pg dump file path>
```

E.g.,

```
pg_restore -v -d postgresql://postgres:***************@localhost:5434/myapp < filename.dump
```

This will restore the records in the DB.

### Attaching a Fly app

Ensure that the fly web app doesnt have a secret key with name `DATABASE_URL`, if secret with name exists then unset that secret by running the following command,

```
 fly secrets unset DATABASE_URL -a <web app name>
```

in this case,

```
 fly secrets unset DATABASE_URL -a myapp
```

This will remove the DATABASE_URL secret from the web app. To attach the fly app to postgress cluster run this following command,

```
flyctl postgres attach <DB app name> --app <web app name>
```

in this case,

```
flyctl postgres attach myapp-db --app myapp
```

Running this command will add DATABASE_URL secret to the web app.
