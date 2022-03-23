const PORT = 8000
const express = require('express')
const {MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
const {v4: uuidv4} = require('uuid')
require('dotenv').config()

const uri = process.env.URI

const api_url = 'https://data.mongodb-api.com/app/data-bfman/endpoint/data/beta/action/'
const header = {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': 'rSPoYCHp1TBLe31jOxTk55ipA3mjrnaT6ifC4L6R4fuXx41f7NEo6WirHU1mbeef'
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json('Hello to my app')
})

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.userIds)
    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const pipeline = [
            {
                '$match': {
                    'user_id': {
                        '$in': userIds
                    }
                }
            }
        ]

        const foundUsers = await users.aggregate(pipeline).toArray()

        res.send(foundUsers)

    } finally {
        await client.close()
    }
})

app.post('/signup', async (req, res) => {
    const {email, password} = req.body
    const client = new MongoClient(uri)
    const generatedUserId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {

        /* --- Поиск записи с таким e-mail --- */
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const existingUser = await users.findOne({email})

        if (existingUser) {
            return res.status(409).send('Пользователь с таким логином уже существует!')
        }

        /* --- Добавление пользователя --- */
        const sanitizedEmail = email.toLowerCase()

        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            password: hashedPassword
        }

        const insertedUser = await users.insertOne(data)

        const token = await jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60 * 24
        })

        res.status(201).json({token, userId: generatedUserId})

    } finally {
        await client.close()
    }

})

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const client = new MongoClient(uri)
    try {

        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const user = await users.findOne({email})
        const correctPassword = await (bcrypt.compare(password, user.password))
        if (user && correctPassword) {
            const token = jwt.sign(user, email, {
                    expiresIn: 60 * 24
                }
            )
            res.status(201).send({token, userId: user.user_id})
        }
        res.status(400).send('Неверные данные авторизации')

    } finally {
        await client.close()
    }
})

app.get('/gendered-users', async (req, res) => {
    const gender = req.query.gender
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db('app-data')
        const collection = database.collection('users')

        const returnedUsers = await collection.find({gender}).toArray()

        res.send(returnedUsers)
    } finally {
        await client.close()
    }
})

app.put('/user', async (req, res) => {
    const formData = req.body.formData
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db('app-data')
        const collection = database.collection('users')
        const query = {user_id: formData.user_id}
        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                db_day: formData.db_day,
                db_month: formData.db_month,
                db_year: formData.db_year,
                gender: formData.gender,
                gender_show: formData.gender_show,
                gender_interest: formData.gender_interest,
                about: formData.about,
                avatar: formData.avatar,
                matches: formData.matches
            }
        }
        const insertedUser = await collection.updateOne(query, updateDocument)

        res.send(insertedUser)
    } finally {
        await client.close()
    }
})

app.get('/user', async (req, res) => {
    const user_id = req.query.userId
    const client = new MongoClient(uri)
    try {

        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const user = await users.findOne({user_id})
        res.send(user)

    } finally {
        await client.close()
    }
})

app.put('/addmatch', async (req, res) => {
    const {userId, matchedUserId} = req.body
    const client = new MongoClient(uri)
    try {

        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = {user_id: userId}
        const updateDocument = {
            $push: {matches: {user_id: matchedUserId}}
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)

    } finally {
        await client.close()
    }
})

app.get('/messages', async (req, res) => {
    const {userId, correspondingUserId} = req.query
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const query = {
            from_userId: userId, to_userId: correspondingUserId
        }

        const foundMessages = await messages.find(query).toArray()

        res.send(foundMessages)
    } finally {
        await client.close()
    }
})

app.post('/message', async (req, res) => {
    const message = req.body.message
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')
        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})



/* ----- Заросы к Atlas по Api  ----- */
app.post('/signupApi', async (req, res) => {
    const {email, password} = req.body

    const generatedUserId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {

        /* --- Поиск записи с таким e-mail --- */
        let axios = require('axios');
        let params = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "email": email
            }
        });

        let config = {
            method: 'post',
            url: api_url + 'findOne',
            headers: header,
            data: params
        };

        let existingUser = null;
        await axios(config)
            .then(function (response) {
                existingUser = response.data.document
            })
            .catch(function (error) {
                res.send(error)
            });

        if (existingUser) {
            return res.status(409).send('Пользователь с таким логином уже существует!')
        }

        const sanitizedEmail = email.toLowerCase()

        /* --- Добавление пользователя --- */

        params = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "document": {
                "user_id": generatedUserId,
                "email": sanitizedEmail,
                "password": hashedPassword
            }
        });

        config = {
            method: 'post',
            url: api_url + 'insertOne',
            headers: header,
            data: params
        };

        let insertedUser = null;
        await axios(config)
            .then(function (response) {
                insertedUser = response.data
            })
            .catch(function (error) {
                res.send(error)
            });

        if (insertedUser) {
            const token = await jwt.sign(insertedUser, sanitizedEmail, {
                expiresIn: 60 * 24
            })

            res.status(201).json({token, userId: generatedUserId})
        } else {
            res.status(401).json({message: "Не удалось добавить пользователя"})
        }
    } catch (err) {
        console.log(err)
    }

})

app.post('/loginApi', async (req, res) => {
    const {email, password} = req.body
    try {
        let axios = require('axios');
        let data = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "email": email
            }
        });

        let config = {
            method: 'post',
            url: api_url + 'findOne',
            headers: header,
            data: data
        };

        let user = null
        await axios(config)
            .then(function (response) {
                user = response.data.document
            })
            .catch(function (error) {
                console.log(error)
            });

        if (user) {
            const correctPassword = await (bcrypt.compare(password, user.password))
            if (correctPassword) {
                const token = jwt.sign(user, email, {
                        expiresIn: 60 * 24
                    }
                )
                res.status(201).send({token, userId: user.user_id})
            }
        }
        res.status(400).send('Неверные данные авторизации')

    } catch (e) {
        console.log(e)
    }
})

app.get('/usersApi', async (req, res) => {
    try {
        let axios = require('axios');
        let data = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0"
        });

        let config = {
            method: 'post',
            url: api_url + 'find',
            headers: header,
            data: data
        };

        await axios(config)
            .then(function (response) {
                const users = response.data.documents
                res.send(users)
            })
            .catch(function (error) {
                res.send(error)
            });
    } catch (e) {
        console.log(e)
    }
})

app.get('/gendered-usersApi', async (req, res) => {
    const gender = req.query.gender
    try {
        let axios = require('axios');
        let data = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "gender": gender
            },
        });

        let config = {
            method: 'post',
            url: api_url + 'find',
            headers: header,
            data: data
        };

        await axios(config)
            .then(function (response) {
                const users = response.data.documents
                res.send(users)
            })
            .catch(function (error) {
                res.send(error)
            });
    } catch (e) {
        console.log(e)
    }
})
app.put('/userApi', async (req, res) => {
    const formData = req.body.formData
    try {
        let axios = require('axios');
        let params = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "user_id": formData.user_id
            },
            "update": {
                "$set": {
                    "first_name": formData.first_name,
                    "db_day": formData.db_day,
                    "db_month": formData.db_month,
                    "db_year": formData.db_year,
                    "gender": formData.gender,
                    "gender_show": formData.gender_show,
                    "gender_interest": formData.gender_interest,
                    "about": formData.about,
                    "avatar": formData.avatar,
                    "matches": formData.matches
                }
            }
        });

        let config = {
            method: 'post',
            url: api_url + 'updateOne',
            headers: header,
            data: params
        };

        let updatedUser = null;
        await axios(config)
            .then(function (response) {
                updatedUser = response.data.document
            })
            .catch(function (error) {
                res.send(error)
            });

        res.send(updatedUser)
    } catch (e) {
        console.log(e)
    }
})

app.get('/userApi', async (req, res) => {
    const user_id = req.query.userId
    try {
        let axios = require('axios');
        let params = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "user_id": user_id
            }
        });

        let config = {
            method: 'post',
            url: api_url + 'findOne',
            headers: header,
            data: params
        };

        let user = null;
        await axios(config)
            .then(function (response) {
                user = response.data.document
                res.send(user)
            })
            .catch(function (error) {
                res.send(error)
            });


    } catch (e) {
        console.log(e)
    }
})

app.put('/addmatchApi', async (req, res) => {
    const {userId, matchedUserId} = req.body
    try {
        let axios = require('axios');
        let params = JSON.stringify({
            "collection": "users",
            "database": "app-data",
            "dataSource": "Cluster0",
            "filter": {
                "user_id": userId
            },
            "update": {
                "$push": {
                    "matches": {user_id: matchedUserId}
                }
            }
        });

        let config = {
            method: 'post',
            url: api_url + 'updateOne',
            headers: header,
            data: params
        };

        let user = null;
        await axios(config)
            .then(function (response) {
                user = response.data.document
                res.send(user)
            })
            .catch(function (error) {
                res.send(error)
            });

    } catch (e) {
        console.log(e)
    }
})


app.listen(PORT, () => console.log('Server running on PORT ' + PORT))
