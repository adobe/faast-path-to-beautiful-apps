# Lesson 3. Create your first Sequence

## Learning Objectives

- Familiarize with Runtime concepts
- Write simple sequence

## Lab Tasks

- Introduction to Sequence
    - Create a simple sequence
    - Invoke sequence via the CLI

---

## Introduction to Sequence
**GOAL:** OpenWhisk supports a special kind of action called a "sequence". These actions are created using a list of existing actions. When the sequence is invoked, each action in executed in a sequence. The input parameters are passed to the first action in the sequence. The output from that function is passed as the input to the next function and so on. The output from the last action in the sequence is returned as the response result. In this section, you will learn how to build a simple sequence in Runtime.

Using sequences is a great way to develop re-usable action components that can be joined together into "high-order" actions to create serverless applications.

For example, what if you have serverless functions to implement an external API and want to enforce HTTP authentication? Rather than manually adding this code to every action, you could define an "auth" action and use sequences to define new "authenticated" actions by joining this action with the existing API actions.

### 1. Create individual actions for the sequence

1. Find the file (sequence.js). This file contains three simple functions, `split`, `reverse` and `join. 
    ```
    function split(params) {
      var text = params.text || ""
      var words = text.split(' ')
      return { words: words }
    }
    
    function reverse(params) {
      var words = params.words || []
      var reversed = words.map(word => word.split("").reverse().join(""))
      return { words: reversed }
    }
    
    function join(params) {
      var words = params.words || []
      var text = words.join(' ')
      return { text: text }
    }
    ```
1. Let's create the following three actions in Runtime to see what they do.
    In the previous chapter, we created actions based on js files. Here, we are using the same js file to define three different actions. Using the `--main` flag, we can define a different entry point for each action.
    ```
    aio runtime action create split ~/Desktop/sequence.js --main split
    aio runtime action create reverse ~/Desktop/sequence.js --main reverse
    aio runtime action create join ~/Desktop/sequence.js --main join
    ```
1. Time to test the actions. 
    ```
    aio runtime action invoke split --result --param text "Hello world"
    {
        "words": [
            "Hello",
            "world"
        ]
    }
    aio runtime action invoke reverse --result --param words '["hello", "world"]'
    {
        "words": [
            "olleh",
            "dlrow"
        ]
    }
    aio runtime action invoke join --result --param words '["hello", "world"]'
    {
        "text": "hello world"
    }
    ```
    Can you figure out what these three actions are doing?

### 2. Create a sequence
1. Now that we have three working actions, let's create an action sequence that uses all three actions to reverse the characters in each word in a phrase. 
    ```
    aio runtime action create reverse_words --sequence split,reverse,join
    ```
1. Time to test
    ```
    aio runtime action invoke reverse_words --result --param text "hello world"
    ```
    you should get a reversed string, like
    ```
    {
        "text": "olleh dlrow"
    }
    ```

---

### Navigate

| **Next:**                                                        |
| ---------------------------------------------------------------- |
| Lesson 4 - [Call Target from Runtime](chapter-4.md) |

**Return Home:** [Workbook Index](../README.md)
