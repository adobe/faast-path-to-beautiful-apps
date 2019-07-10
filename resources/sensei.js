/*
requires following params
    ent_api_key
    ent_auth_token
    image_url
    results : default 10
    confidence : default 0.5
Returns JSON
{
    "tags" : [{"tag": "car", "confidence": 0.7}]
}
*/

var request = require("request");
var fs = require("fs");
var util = require('util');

function main(params) {

    console.log(params);

    return new Promise((resolve, reject) => {
    try{

        if(!params.ent_api_key || !params.accessToken || !params.image_url) {
            throw new Error("Missing one or more required params ent_api_key, ent_auth_token, image_url");
        }
        console.log("action called with params - " + util.inspect(params));

        var filename = params.image_url;

        getTags(params, filename)
        .then((tags) => { 
          console.log(tags);
          resolve(adaptResult(tags, params.results));
        })
        .catch((err) => {
            console.log("err " + err);
            reject(err);
        });

        
    }
    catch(error) {
        console.log("error trying to autotag - " + error);
        reject(error);
    }
});

}

function getTags(params, fileName){

    var options = { 
      method: 'POST',
      url: 'https://sensei.adobe.io/analyzers',
      headers: { 
        'x-api-key': params.ent_api_key,
        'content-type': 'multipart/form-data',
        'cache-control': 'no-cache',
        Authorization: 'Bearer ' + params.accessToken
      },
  formData: 
   { fileURL: fileName,
     contentAnalyzerRequests: '{ "requests": [{ "analyzer_id": "classifier:tagging:1", "parameters": { "model": "stock7" } } ] }' }
 };

  return new Promise((resolve, reject) => {
    try{

        request(options, function (error, response, res) {

          if (error){ 
            console.log("error - " + error);
            reject(error);
          }
          else {
            console.log("image analysed successfully ");
            resolve(response.body);
        }
        });
    }
    catch(error) {
        console.log("error - " + error);
        reject(error);
    }
    
  });
}

function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString('base64');
}

function adaptResult(newFormat, resultSize){
  var oldFormat = { tags: []};
  var newTags = JSON.parse(newFormat);
  console.log("adapting result");
  var classArray = newTags.cas_responses[0].result.response.classification_entries
  if(classArray) {
    console.log("got classifications " + classArray.length);
    var limit = resultSize;
    if(classArray.length < resultSize)
      limit = classArray.length;

    console.log("result limit " + limit);

    for (var i = 0; i < limit; i++) {
      var tag = classArray[i].class.name
      var obj = {}
      obj.tag = tag;
      obj.confidence = classArray[i]["classification-info"].confidence;
      oldFormat.tags.push(obj);
    }
  } 
  return oldFormat; 
}