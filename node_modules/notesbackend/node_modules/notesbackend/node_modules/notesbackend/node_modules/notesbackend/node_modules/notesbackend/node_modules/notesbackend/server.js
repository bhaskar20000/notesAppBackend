const express = require('express')
const app = express();
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const dbPath = path.join(__dirname , "notesApp.db")
let db 

const initailizer = async () => {
    try{
        db = await open({
            filename : dbPath , 
            driver : sqlite3.Database
        })
        app.listen(3000, () => {
            console.log('Server is running at http://localhost:3000');
        });
    }
    catch(e){
        console.log(e.message)
    }
}

initailizer()


app.post('/user/register' , async (request , response) => {
    const {name , email , password} = request.body
    const nameCheck = `
        SELECT name FROM user WHERE name = "${name}"
    `

    const emailCheck = `
        SELECT email FROM user WHERE email = "${email}"
    `
    const checkResponse = await db.get(nameCheck) 
    const emailResponse = await db.get(emailCheck)


    if (checkResponse === undefined){
        const hashedPassword = await bcrypt.hash(password , 10)
        if (emailResponse === undefined){
            const detailsUpload = `
                INSERT INTO  user  (name , email , password)
                VALUES ("${name}" , "${email}" , "${hashedPassword}");
            `
            const detailsResponse = await db.run(detailsUpload) 
            response.send(`User ${name} created succesfully`)

        }
        else{
            response.send('email already exits!!!')
        }
    }
    else{
        response.send("user already exists!!!")
    }
})


app.post('/user/login' , async (request , response) => {
    const {name , password} = request.body 
    const userPassword = password ;
    const checkName = `
        SELECT name FROM user WHERE name = "${name}"
    `

    const allDataFetch = `
        SELECT * FROM user WHERE name = "${name}"
    `
    const allDataFetchResponse = await db.all(allDataFetch)
    const checkNameResponse = await db.get(checkName)

    if (checkNameResponse === undefined){
        response.send("user doesn't exist please sign in first")
    } 
    else{
        const {password} = allDataFetchResponse[0] 
        const passCheck = await bcrypt.compare(userPassword , password)
        if (passCheck){
            const jwtToken = jwt.sign({username:name},"NOTES")
            response.send(jwtToken)
        }
        else{
            response.send('Invalid Password')
        }

    }

})





