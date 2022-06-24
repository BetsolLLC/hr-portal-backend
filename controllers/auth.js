import pool from '../db.js';
import bcrypt from 'bcrypt';;
import generator from 'generate-password';

const login = async (req, res) => {
return	res.send("User logged in");
};

const adduser = async(req,res) => {
    try {
        //checking the user already exist 
        const { name,email,batch,number} = req.body;

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
            email
          ]);
      
        if (user.rows.length > 0) {
            return res.status(409).json("User already exist!");
        }
        
        //generating a random password
        var password = generator.generate({
            length: 10,
            numbers: true
        });

        //encrption of the password 

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);
        // adding new user
        const newUser = await pool.query("INSERT INTO users (name,email,batch,phone_number,password) VALUES ($1,$2,$3,$4,$5)",
        [name,email,batch,number,bcryptPassword]
        );
        res.send("user added");
    
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error")
    }
}
// module.exports = router;
export { login };
export default adduser;