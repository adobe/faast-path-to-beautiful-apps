# Lesson 2. Create your first Runtime Action

## Learning Objectives

- Familiarize with Runtime concepts
- Write simple Runtime actions

## Lab Tasks

- Runtime Hello World
    - Create a simple Hello World action
    - Invoke actions via the CLI and browser

---

## Runtime Hello World
**GOAL:** In this section, let's familiarize with Runtime and the Adobe I/O CLI. Interacting with Adobe I/O Runtime currently requires the CLI (Command Line Interface). If you've completed the set up steps, you should have access to your own Runtime namespace. 

Feel free to play with the CLI while I walk you through a few key concepts in Runtime. 

### 1. Basic Hello World
Once you've configured the CLI, you can create your first function to make sure it's working. 

1. Start by creating a file called `hello.js` on your Desktop with the following content
    ```
    function main(params) {
      return {msg:  'Hello World!'};
    }
    ```

1. Next, create the action on Runtime: 
    ````
    $ cd ~/Desktop
    $ aio runtime action create hello ~/Desktop/hello.js
    ````
    If it's successful, you should see 
    ```
    ok: created action hello
    ```
1. Time to invoke the function:
    ```
    $ aio runtime action invoke hello --result
    ```
    You should see the following output:
    ```
    {
      "msg": "Hello World!"
    }
    ```
1. You can also find out more about your activation by checking the activation log. Let's invoke it again.
    ```
    $ aio runtime action invoke hello
    ```
    Upon invocation, you should also see an output that looks a bit like
    ```
    ok: invoked /your-namespace/hello with id <id>
    ```
    Copy the ID and let's read the full activation log at 
    ```
    $ aio runtime activation get <id>
    ```

### 2. Fun with Parameters
1. Now that you've created and invoked your first action, let's try to update it to take in dynamic input. Beginning with modifying your `hello.js` file.
    ```
    function main(params) {
      // log the parameters to stdout
      console.log('params:', params);
    
      // if a value for name is provided, use it else use a default
      var name = params.name || 'stranger';
    
      // if a value for place is provided, use it else use a default
      var place = params.place || 'somewhere';
    
      // construct the message using the values for name and place
      return {msg:  'Hello, ' + name + ' from ' + place + '!'};
    }
    ```
    then update your action using 
    ```
    aio runtime action update hello ~/Desktop/hello.js
    ```
1. Now that we have an updated action that takes params, try invoking your action again, first without parameter to see the default response
    ```
    $ aio runtime action invoke hello --result
    ```
    You should see the following output:
    ```
    {
      "msg": "Hello, stranger from somewhere!"
    }
    ```
1. Time to pass in some parameters!
    ```
    $ aio runtime action invoke hello --result --param name "Sarah" --param place "Canton"
    ```
    You should see the following output:
    ```
    {
        "msg": "Hello, Sarah from Canton!"
    }
    ```
1. Sometimes it is helpful to invoke an action in a blocking style and receiving the activation record entirely instead of just the result. Try it:
    ```
    $ aio runtime action invoke hello --blocking
    ```
    You should see the full activation log
    ```
    ok: invoked /43611_56921/hello with id 352f8bf3eb3f4619af8bf3eb3f5619fc
    {
        "activationId": "352f8bf3eb3f4619af8bf3eb3f5619fc",
        "annotations": [
            {
                "key": "limits",
                "value": {
                    "concurrency": 1,
        ...
    }

    ```
### 3. Understand web actions
1. Web actions are OpenWhisk actions annotated to quickly enable you to build web based applications. Let's now turn the action we built into a web action. Open `hello.js` and update the code as below
    ```
    function main(params) {
      // log the parameters to stdout
      console.log('params:', params);
    
      // if a value for name is provided, use it else use a default
      var name = params.name || 'stranger';
    
      // if a value for place is provided, use it else use a default
      var place = params.place || 'somewhere';
      
      // sample object returned in a web action
      var returnObject = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {msg:  'Hello, ' + name + ' from ' + place + '!'}
      };
    
      // construct the message using the values for name and place
      return returnObject;
    }
    ```
1. Update your hello action again, but with the `--web true` flag to indicate that this is a web action
    ```
    $ aio runtime action update hello ~/Desktop/hello.js --web true
    ```
1. Now, let's grab the url that we can use to call this actiON
    ```
    $ aio runtime action get hello --url
    ```
    This should return something that looks like ```https://adobeioruntime.net/api/v1/web/<NAMESPACE>/default/hello```
1. Let's paste this url into your browser and see what you receive. It should be the same json response!
    ```
    // 20190307183813
    // https://adobeioruntime.net/api/v1/web/<NAMESPACE>/default/hello
    
    {
      "msg": "Hello, stranger from somewhere!"
    }
    ```
1. **Challenge:** Can you figure out how to modify the url so that the response says "Hello, Dragos from Iaschi!"
    - Bonus point if you know where Iaschi is :)
---

### Navigate

| **Next:**                                                        |
| ---------------------------------------------------------------- |
| Lesson 3 - [Create your first Sequence](chapter-3.md) |

**Return Home:** [Workbook Index](../README.md)
