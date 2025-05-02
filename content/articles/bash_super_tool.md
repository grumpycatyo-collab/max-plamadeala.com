---
title: "Bash as a super tool"
publishDate: 2025-05-02
description: "Things I learnt about bash."
slug: "bash_super_tool"
featured: false
---

Bash or mainly `Bourne-Again SHell` is an interactive command interpreter and command programming language as Wiki says. As an Engineer you typically use it every day, to run commands and do `magic`.

I call `Bash` a scripting language, same as `Python`, because you can write commmands and functions in there, and run them immediately without further ado. That's why I love it, because you can automate, create and do a lot of things with it.

Now let's proceed on actually using it.

## Usage

### `./bashrc`
Before starting, you should know what's `~/.bashrc`. Mainly, it's a file that is executed every time you open a new terminal. So if you want to add some aliases or functions, you can do it there. For example, I have the following:

```bash
alias g="git"
alias gs="git status"
alias gcm="git commit -m"
alias gco="git checkout"
```
This way, I can use `g` instead of `git`, and so on. You can add any command you want there, and it will be available every time you open a new terminal. This is btw an `alias`, which is a shortcut for a command. You can create your own aliases for any command you want.

Now to save the changes in the `~/.bashrc`, you need to run the following command:

```bash
source ~/.bashrc # source is a command that executes the file in the current shell
```
This will reload the file and apply the changes.

### Managing files
Now let's see some examples of how to use `Bash` in your daily life.

You can use it for file management, for example:

```bash
mkdir ~/projects # create a new directory
cd ~/projects # change directory to projects
touch file.txt # create a new file
ls # list files in the current directory
ll # list files in the current directory with details
rm file.txt # remove a file
```

Btw, in `./bashrc` there is an `alias` for `ll`:

```bash
alias ll='ls -alF'
```

### Environment variables

With `bash` you can also do work with environment variables. For example, you can set a variable like this:

```bash
export API_PORT="8000"
```

So somewhere in your `launch_api.sh` code you can use it like this:

```python
#!/bin/bash
export API_PORT="8000"
python3 -m flask run --host=localhost --port=$API_PORT
```

Whereas `export` is setting a variable in the current shell and all child processes. You can run `echo` afterwards to see if the variable is set:

```bash
echo $API_PORT # this will print 8000
```

### Serious stuff

Now let's see how you can combine multiple scripts and commands and automate whole processes.
Suppose you have a linter that checks your code and fixes your code, like [`ruff`](https://docs.astral.sh/ruff/) and before starting the server you want to check if the code is clean. You can do it like this:

```bash
#!/bin/bash
# Using  ruff==0.1.15
ruff --fix . # this will check and fix the code
ruff format . # this will format the code
```

And then you can run the server like this:

```bash
#!/bin/bash
export API_PORT="8000"
python3 -m flask run --host=localhost --port=$API_PORT
```

We assume that these are two files: `linter.sh` and `launch_api.sh`. Before you run them, you first of all want to give them exectution permissions:
```sh
chmod +x linter.sh # chmod is a command that changes the permissions of a file
chmod +x launch_api.sh
```

Also since you know about `./bashrc`, you can add the following `alias` there:

```bash
alias linter="./path/to/linter.sh"
alias launch_api="./path/to/launch_api.sh"
```
This way, you can run the linter and then the server like this:

```bash
linter && launch_api
```
This will run the linter and if it succeeds, it will run the server. If the linter fails, it won't run the server.

## Conclusion

`Bash` has much more stuff to offer and I am still learning it. I hope this article was useful for you and you learnt something new. If you have any questions or suggestions, please let me know in the comments (I hope there will be some).

Have a good one! Bye!