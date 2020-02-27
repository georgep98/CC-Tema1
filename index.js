const http = require('http')
const port = 3000
const fs = require('fs');
const url = require('url');
const {performance} = require('perf_hooks');

const appl = fs.readFileSync("appl.html")

const requestHandler = (request, response) => {
    const req = require('request');
    var pathname = url.parse(request.url, true).pathname;

    switch (pathname) {
        case '/':
            response.setHeader("Content-Type", "text/html");

            response.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            response.end(appl);
            break;

        case '/movies':

            request.on('data', chunk => {
                var data = ''; // convert Buffer to string
                data += chunk.toString();
                // var t0 = performance.now()
                var options = {
                    method: 'GET',
                    url: 'https://movie-database-imdb-alternative.p.rapidapi.com/',
                    qs: { page: '1', r: 'json', s: data },
                    headers: {
                        'x-rapidapi-host': 'movie-database-imdb-alternative.p.rapidapi.com',
                        'x-rapidapi-key': '7f486f9f78mshdac540c62b54785p195caejsn55d7e9c7c74e'
                    }
                };

                req(options, function (error, res, body) {
                    if (error) throw new Error(error);
                    // var t1 = performance.now();
                    // console.log("Call to get movie took " + (t1 - t0) + " milliseconds.");
                    response.end(body);
                });
            });

            break;

        case '/actors':


            request.on('data', chunk => {
                var data = ''; // convert Buffer to string
                data += chunk.toString();

                data = data.replace(/\s+/g, '%20');

                var options = {
                    method: 'GET',
                    url: 'https://tvjan-tvmaze-v1.p.rapidapi.com/search/people',
                    qs: { q: data },
                    headers: {
                        'x-rapidapi-host': 'tvjan-tvmaze-v1.p.rapidapi.com',
                        'x-rapidapi-key': '7f486f9f78mshdac540c62b54785p195caejsn55d7e9c7c74e'
                    }
                };

                req(options, function (error, res, body) {
                    if (error) throw new Error(error);

                    response.end(body);
                });
            })
            break;

        case '/check-actor':
            request.on('data', chunk => {
                var data = ''; // convert Buffer to string
                data += chunk.toString();

                var myBody = JSON.parse(data);

                var options = {
                    method: 'GET',
                    url: 'https://movie-database-imdb-alternative.p.rapidapi.com/',
                    qs: { i: myBody.imdbId[0], type: 'movie', r: 'json' },
                    headers: {
                        'x-rapidapi-host': 'movie-database-imdb-alternative.p.rapidapi.com',
                        'x-rapidapi-key': '7f486f9f78mshdac540c62b54785p195caejsn55d7e9c7c74e'
                    }
                };

                req(options, function (error, res, body) {
                    if (error) throw new Error(error);

                    response.end(body);
                });

            });

            break;
    }

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }


    console.log(`server is listening on ${port}`)
})


