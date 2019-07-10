# Lesson 0. Pre-requisites: Set up your machine

## Tasks

- Set up local machine
    - Text Editor
    - Terminal
    - Node & NPM
    - Adobe I/O CLI
    - Serverless CLI
    - OpenSSL
- Download all required resources

---
## Set up local machine

### 1. Text Editor
Please make sure you have a text editor available on your laptop. It can be TextEdit, Sublime, Brackets, or other IDEs you like.

### 2. Terminal / Command Prompt
You will have to type in commands, using the Terminal application in Mac OS X. You can find the Terminal application in the Application > Utilities folder.

On Windows, Terminal is named Command Prompt program.


### 3. Node and NPM

1. To check if you have Node.js installed, run this command in your terminal:
    ```
    $ node -v
    ```
1. To confirm that you have npm installed you can run this command in your terminal:
    ```
    $ npm -v
    ```
1. If not, you can download both at [NPM](https://nodejs.org/en/).
      
### 4. Adobe I/O CLI

1. Open your Terminal, and type in the following command
    ```
    $ npm install -g @adobe/aio-cli
    ```
    Please make sure the command succeed. If it fails with permissions issue, try it with `sudo` in front of it (e.g. `sudo npm link`). `sudo` command will prompt you to type the password before proceeding to complete the command.
    
1. To confirm that you have aio installed, you can run this command in your terminal:
    ```
    $ aio
    ```

1. Let's also add the aio Runtime plugin. 
    ```
    $ aio plugins install @adobe/aio-cli-plugin-runtime
    ```

### 5. Serverless CLI

1. Open your Terminal, and type in the following command
    ```
    $ npm install -g serverless
  
    ```
    If this command fails with permissions issue, try it with `sudo` in front of it (e.g. `sudo npm install -g serverless`). `sudo` command will prompt you to type the password before proceeding to complete the command.
1. To confirm that you have serverless installed you can run this command in your terminal:
    ```
    $ serverless --help
    ```
    
### 6. OpenSSL (for Windows users only)

1. Please download [OpenSSL Client](https://bintray.com/vszakats/generic/download_file?file_path=openssl-1.1.1-win64-mingw.zip)
1. Extract the folder and copy it to the C:/libs/ location.

  
## Download all required resources

- Download the [resources package](../resources.zip)
- Unzip it and place the content of the folder on your Desktop

---

### Navigate

| **Next:**                                                        |
| ---------------------------------------------------------------- |
| Lesson 1 - [Set up your Runtime Namespace](chapter-1.md) |

**Return Home:** [Workbook Index](../README.md)
