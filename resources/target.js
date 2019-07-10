var request = require("request");

function main(params) {
    var accessToken = "Bearer " + params.accessToken;
    var tenant = "summit2017lab";
    var client_id = params.client_id; 
    
    console.log('access token: ', accessToken);
    console.log('tenant: ', tenant);
    console.log('client_id: ', client_id);
    
    return new Promise (function (resolve, reject) {

        try {
            
            console.log("in promise");
            
            var options = { 
                method: 'GET',
                url: 'https://mc.adobe.io/' + tenant + '/target/activities',
                headers: {
                 'Content-Type': 'application/vnd.adobe.target.v1+json',
                 'X-Api-Key': client_id,
                 Authorization: accessToken } 
            };
            
            console.log(JSON.stringify(options));

            request(options, function (error, response, body) {
              if (error){
                    console.log("request error" + error);
                    reject(error);
                } else {
                    console.log("request return");
                    var result = JSON.parse(body);
                    resolve(
                        {result : result});
                }
            });

        } catch (e) {
            console.log ("caught error" + e);
            reject(e);
        }
    })
}

exports.main = main;