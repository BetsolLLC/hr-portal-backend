import pool from '../db.js';
const login = async (req, res) => {
return	res.send("User logged in");
};

const adduser = async(req,res) => {
    try {
        //checking the user already exist 
        const { name,email} = req.body;

        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
            email
          ]);
      
        if (user.rows.length > 0) {
            return res.status(401).json("User already exist!");
        }
        
        // adding new user
        const newUser = await pool.query("INSERT INTO users (user_name,user_email,user_password) VALUES ($1,$2,'welcome@123')",
        [name,email]
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