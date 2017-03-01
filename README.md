# delBoy
a super thin layer to be able to publish to reggie private server without npm dependencies

# Why?

we use a private npm respository for our own packages, and pushing
packages to this repository was a struggle given how outdated the
tooling around this service is. (reggie)[https://github.com/mbrevoort/node-reggie]

# Using delBoy

in the package you wanna start publishing

```
 npm install --save-dev delBoy
```
or if you are using yarn

```
 yarn add delBoy
```

#Publishing

assuming everything is ready (version changed and such)

```
delBoy publish

```

you can provide several information in order to make this process more
specific.


#Options

    -`u`: the private package server we wish to send our module (by default would look at package.json, specifically to the option `"publishConfig": { "registry": "http://private-url:port/"}`). It can be specified when calling delBoy (ex: `delBoy -u http://my-private-npm-server:port/` )
    - `dir`:  the directory we want to build the package from (eg. current directy) (ex: `delBoy -dir ~/my_fancy_package -u http://my-private-npm-server:port/` )
    - `package`: '(ex: `delBoy -dir ~/my_fancy_package -u http://my-private-npm-server:port/ -package ~/my_fancy_package/package.json`)
