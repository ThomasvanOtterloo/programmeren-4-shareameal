
# programeren 4 - Creating my API



## Introduction

Hello, My name is Thomas van Otterloo. I had to create this API for a school project. In 4th period of the year it was our job to create a functional API where we can request and send all kinds of data. Read "How to use" to see the commands that are used for this API.


# programeren 4 - Creating my API



## Introduction

Hello, My name is Thomas van Otterloo. I had to create this API for a school project. In 4th period of the year it was our job to create a functional API where we can request and send all kinds of data. Read "How to use" to see the commands that are used for this API.


## Features
The following http requests are available in this API
- GET
- DELETE
- POST
- PUT



## How to use

This API contains 2 routes so far. (login, profile, users, meals).

The start of a route usually begins with "/api/". See the following commands on how to use this API.

#### Start commands
To log in and actually create objects or ask for specific information you will have to create an account.

* .POST > /api/user <To create a new user you can login in with>
* .POST > /auth/login <To log in with your new created user>
* .GET > /api/profile <Test to see if you are logged in and check to see your own information of your user.>
* .PUT > /api/user/:ID <Update any details of your own ID user>
* .DELETE > /api/user/:ID <To delete your own account>
#### Commands once you are logged in.

Commands you can use for table Users.
* .GET > /api/user <To see a list of all available users>
* .GET > /api/user/:ID <To see a specific user>


commands you can use for table meals. *NOTE: you can only edit or delete objects that are created by your account*
* .GET > /api/meal <Recieve a list of all available meals>
* .GET > /api/meal/:ID <Look for a specific meal with the given ID>
* .POST > /api/meal <To create a new meal your self that is connected to your user ID and yours alone!>
* .PUT > /api/meal/:ID <To update/edit any details on your newly created meal>
* .DELETE > /api/meal:ID <To delete a meal you have created>

### USERS QUERIES
Queries you can use in your requests for USERS

* firstName
* lastName
* isActive
* showUsers (shows the amount of users you would like to see)

Combination of queries you can use for USERS:

* firstName & showUsers
* firstName & lastName

### MEALS QUERIES
queries you can use for MEALS:
* maxAmountOfParticipants
* isActive
* showMeals (shows the amount of meals you would like to see)
* isvega

Combination of queries you can use for MEALS:
* maxAmountOfParticipants & isActive
* showMeals & isVega

But how? Simply just write a query in your URL (Take a look at the screenshots for an example)


## Screenshots

![App Screenshot](data:image/png;base64,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)

