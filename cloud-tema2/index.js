const http = require('http')
const port = 3000
const fs = require('fs');
const url = require('url');
const mongoose = require("mongoose");


mongoose.connect('mongodb://localhost/cloudData');

mongoose.connection.on("error", (err) => {
    console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected");
});


const Schema = mongoose.Schema;

const usersSchema = new Schema({
    email: String,
    password: String,
    origins: String,
    age: Number,
});


const Users = mongoose.connection.model('Users', usersSchema)



const user = new Users({ email: 'George@yahoo.com', password: '1234567', origins: 'Romania', age: 22 });


// mongoose.connection.once('connected', (err) => {
//     if (err) {
//         return console.error('err');
//     } else {
//         Users.create(user, (err, document) => {
//             if (err) {
//                 console.error(err);
//             }
//             console.log('++user\n', document);
//         })
//     }
// });



const requestHandler = (request, response) => {
    const req = require('request');
    var pathname = url.parse(request.url, true).pathname;

    var pathnameComponents = pathname.split("/");
    console.log('+++ pathnameComponents', pathnameComponents);
    var method = request.method;

    switch (pathnameComponents[1]) {
        case '':
            response.setHeader("Content-Type", "text/html");

            response.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            response.end();
            break;

        case 'get-users':
            if (pathnameComponents.length <= 2) {
                Users.find({}, '', (err, users) => {
                    if (err) {
                        response.statusCode = 500;
                        response.end();
                        return;
                    } else {
                        response.statusCode = 200;
                        console.log('+++ users', users);
                        response.end(JSON.stringify({ "Users": users }))
                    }
                })
            } else {
                let userId = pathnameComponents[2];
                Users.findById(userId, '', (err, user) => {
                    if (user === null) {
                        response.statusCode = 404;
                        response.end('User not found!')
                        return;
                    } else
                        if (err) {
                            response.statusCode = 500;
                            response.end();
                        } else {
                            response.statusCode = 200;
                            response.end(JSON.stringify({ user }))
                        }
                })
            }

            break;

        case 'delete-user':
            if (pathnameComponents.length > 2) {
                let userId = pathnameComponents[2];
                Users.findByIdAndRemove(userId, (err, success) => {
                    if (err) {
                        response.statusCode = 404;
                        response.end('User not found');
                        return;
                    } else {
                        response.statusCode = 200;
                        response.end('Success');
                        return;
                    }
                })
            } else {
                Users.remove({}, (err, success) => {
                    if (err) {
                        response.statusCode = 500;
                        response.end();
                    } else {
                        response.statusCode = 200;
                        response.end('Success');
                    }
                })
            }

            break;

        case 'add-user':


            request.on('data', chunk => {
                var data = ''; // convert Buffer to string
                data += chunk.toString();

                let myBody = JSON.parse(data);

                if (myBody.length === 1) {
                    let userToAdd = new Users();

                    userToAdd.email = myBody.email;
                    userToAdd.password = myBody.password;
                    userToAdd.origins = myBody.origins;
                    userToAdd.age = myBody.age;

                    userToAdd.save((err) => {
                        if (err) {
                            response.statusCode = 500;
                            response.end();
                        } else {
                            response.statusCode = 200;
                            response.end('User successfully added');
                        }
                    })
                } else {
                    for (let i = 0; i < myBody.length; i++) {
                        let userToAdd = new Users();

                        userToAdd.email = myBody[i].email;
                        userToAdd.password = myBody[i].password;
                        userToAdd.origins = myBody[i].origins;
                        userToAdd.age = myBody[i].age;

                        userToAdd.save((err) => {
                            if (err) {
                                response.statusCode = 500;
                                response.end();
                            }
                        })
                    }

                    response.statusCode = 200;
                    response.end('Successfully added')
                }


            })
            break;

        case 'update-user':
            request.on('data', chunk => {
                let UserId = pathnameComponents[2];
                var data = ''; // convert Buffer to string
                data += chunk.toString();

                var myBody = JSON.parse(data);

                Users.findById(UserId, (err, user) => {
                    if (err) {
                        response.statusCode = (404);
                        response.end('User not found!');
                    }

                    if (user === null) {
                        response.end('No user with such id')
                        return;
                    }

                    user.email = myBody.email;
                    user.origins = myBody.origins;
                    user.age = myBody.age;
                    user.password = myBody.password;

                    user.save((err) => {
                        if (err) {
                            response.statusCode = 500;
                            response.end();
                        } else {
                            response.statusCode = 200;
                            response.end('User successfully updated');
                        }
                    })
                })

            });
            break;


        case 'update-emails':
            let email = pathnameComponents[2];

            Users.updateMany({}, { $set: { "email": email } }, (err, success) => {
                if (err) {
                    response.statusCode = 500;
                    response.end();
                } else {
                    response.statusCode = 200;
                    response.end('Emails successful updated');
                }
            })
    }

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }


    console.log(`server is listening on ${port}`)
})


